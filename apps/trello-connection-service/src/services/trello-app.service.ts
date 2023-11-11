import logger from 'express-logger';
import { OAuth } from 'oauth';

import {
    ACCESS_URL,
    APP_NAME,
    AUTHORIZE_URL,
    REDIRECT_URL,
    REQUEST_URL,
    SCOPE,
    TRELLO_KEY,
    TRELLO_OAUTH_SECRET,
} from '../constants';
import { cryptoService, redisClient, secretsManager } from 'core';
import { InvalidQueryParams, MissingSecretTokenValue } from '../helpers/exceptions';

const oauth = new OAuth(REQUEST_URL, ACCESS_URL, TRELLO_KEY, TRELLO_OAUTH_SECRET, '1.0A', REDIRECT_URL, 'HMAC-SHA1');

export class TrelloAppService {
    public async getAuthRedirectUrl() {
        try {
            const token = await new Promise((resolve) =>
                oauth.getOAuthRequestToken(async function (_, token, tokenSecret, __) {
                    await redisClient.set(`trello:tokens:${token}`, tokenSecret);
                    resolve(token);
                }),
            );

            return `${AUTHORIZE_URL}?oauth_token=${token}&name=${APP_NAME}&scope=${SCOPE}`;
        } catch (e) {
            const error = e instanceof Error ? e?.message : String(e);
            logger.error('Failed to get access token', { error });

            throw e;
        }
    }

    public async storeAccessToken(token: string, verifier: string): Promise<void> {
        if (typeof token !== 'string' || typeof verifier !== 'string') {
            throw new InvalidQueryParams('Something went wrong. Please try again later');
        }
        const tokenSecret = await redisClient.get(`trello:tokens:${token}`);
        if (!tokenSecret) {
            throw new MissingSecretTokenValue('Missing secret token value');
        }

        await new Promise((resolve, reject) =>
            oauth.getOAuthAccessToken(token, tokenSecret, verifier, async function (_, accessToken, accessTokenSecret) {
                oauth.getProtectedResource(
                    'https://api.trello.com/1/members/me',
                    'GET',
                    accessToken,
                    accessTokenSecret,
                    async function (_, data, __) {
                        if (!data) return reject();

                        const response = JSON.parse(data.toString());
                        if (!response || !response.email) return reject();

                        const hashedEmail = cryptoService.valueToUniqueString(response.email);
                        const path = `/users/${hashedEmail}`;
                        await secretsManager.createSecret(
                            'TRELLO_CREDS',
                            JSON.stringify({ accessToken, accessTokenSecret }),
                            path,
                        );
                        resolve(path);
                    },
                );
            }),
        );
    }
}

export default new TrelloAppService();
