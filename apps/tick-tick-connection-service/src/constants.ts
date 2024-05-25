import { envUtils } from 'core';

export const ORIGIN = envUtils.getEnvVar('ORIGIN', '*', false);
export const REDIRECT_URL = envUtils.getEnvVar('REDIRECT_URL', '', false);
export const SCOPE = envUtils.getEnvVar('SCOPE', '', false);

export const TICK_TICK_CLIENT_ID = envUtils.getEnvVar('TICK_TICK_CLIENT_ID', '', false);
export const TICK_TICK_CLIENT_SECRET = envUtils.getEnvVar('TICK_TICK_CLIENT_SECRET', '', false);
export const TICK_TICK_OAUTH_URL = envUtils.getEnvVar('TICK_TICK_OAUTH_URL', '', false);
