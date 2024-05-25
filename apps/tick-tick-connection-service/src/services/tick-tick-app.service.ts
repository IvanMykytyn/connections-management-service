import logger from 'express-logger';
import { REDIRECT_URL, SCOPE, TICK_TICK_CLIENT_ID, TICK_TICK_CLIENT_SECRET, TICK_TICK_OAUTH_URL } from '../constants';
import axios, { AxiosRequestConfig } from 'axios';
import { InvalidQueryParams } from '../helpers/exceptions';
import { cryptoService, secretsManager } from 'core';

export class TickTickAppService {
    public async getAuthRedirectUrl(state: Record<string, string>): Promise<string> {
        try {
            const url = new URL(`${TICK_TICK_OAUTH_URL}/authorize`);
            url.searchParams.append('client_id', TICK_TICK_CLIENT_ID);
            url.searchParams.append('scope', SCOPE);
            url.searchParams.append('state', JSON.stringify(state));
            url.searchParams.append('redirect_uri', REDIRECT_URL);
            url.searchParams.append('response_type', 'code');

            return url.toString();
        } catch (e) {
            const error = e instanceof Error ? e?.message : String(e);
            logger.error('Failed to get auth redirect url', { error });

            throw e;
        }
    }

    public async getAccessToken(code: string): Promise<Record<string, string | number>> {
        try {
            if (typeof code !== 'string') {
                throw new InvalidQueryParams('Something went wrong. Please try again later');
            }
            const url = new URL(`${TICK_TICK_OAUTH_URL}/token`);
            const body = new FormData();

            body.append('client_id', TICK_TICK_CLIENT_ID);
            body.append('client_secret', TICK_TICK_CLIENT_SECRET);
            body.append('code', code);
            body.append('grant_type', 'authorization_code');
            body.append('scope', SCOPE);
            body.append('redirect_uri', REDIRECT_URL);

            const config: AxiosRequestConfig = {
                url: url.toString(),
                method: 'POST',
                data: body,
                headers: {
                    Authorization: `Basic ${Buffer.from(`${TICK_TICK_CLIENT_ID}:${TICK_TICK_CLIENT_SECRET}`).toString(
                        'base64',
                    )}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            };

            const response = await axios.request(config);
            return response.data;
        } catch (e) {
            const error = e instanceof Error ? e?.message : String(e);
            logger.error('Failed to get access token', { error });

            throw e;
        }
    }
    public async storeAccessToken(email: string, accessToken: Record<string, string | number>): Promise<void> {
        try {
            const hashedEmail = cryptoService.valueToUniqueString(email);
            const path = `/users/${hashedEmail}`;
            await secretsManager.createSecret('TICK_TICK_CREDS', JSON.stringify(accessToken), path);
        } catch (e) {
            const error = e instanceof Error ? e?.message : String(e);
            logger.error('Failed to store access token', { error });

            throw e;
        }
    }
}

export default new TickTickAppService();
