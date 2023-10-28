import { envUtils } from 'core';

export const GCP_PROJECT = envUtils.getEnvVar('GCP_PROJECT_NAME', undefined, false) || '';
export const ORIGIN = envUtils.getEnvVar('ORIGIN', '*', false);
export const REDIRECT_DOMAIN = envUtils.getEnvVar('REDIRECT_DOMAIN', '', false);
