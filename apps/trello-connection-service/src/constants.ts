import { envUtils } from 'core';
import { AppOptions } from 'firebase-admin';

export const GCP_PROJECT = envUtils.getEnvVar('GCP_PROJECT_NAME', undefined, false) || '';
export const ORIGIN = envUtils.getEnvVar('ORIGIN', '*', false);
export const REDIRECT_DOMAIN = envUtils.getEnvVar('REDIRECT_DOMAIN', '', false);
export const TRELLO_KEY = envUtils.getEnvVar('TRELLO_KEY', '', false);
export const TRELLO_OAUTH_SECRET = envUtils.getEnvVar('TRELLO_OAUTH_SECRET', '', false);
export const FIREBASE_APP_OPTIONS = envUtils.getEnvVar<AppOptions>('FIREBASE_APP_OPTIONS', undefined, true);

export const REQUEST_URL = 'https://trello.com/1/OAuthGetRequestToken';
export const ACCESS_URL = 'https://trello.com/1/OAuthGetAccessToken';
export const AUTHORIZE_URL = 'https://trello.com/1/OAuthAuthorizeToken';
export const APP_NAME = 'Trello OAuth with Task Organizer';
export const SCOPE = 'read,account';
export const REDIRECT_URL = new URL('trello/auth/callback', REDIRECT_DOMAIN).toString();
