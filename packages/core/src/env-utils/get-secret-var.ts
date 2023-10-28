import secretsManager from '../clients/secrets-manager';

class MissingSecretVarError extends Error {}

interface IGetSecretProps<T> {
    key: string;
    defaultValue?: T;
    jsonParse?: boolean;
    path?: string;
}
/**
 * Get env var
 *
 * If no default was set, will raise an error
 * If JSON Parse is set as true, will parse the env value as JSON
 *
 * @param key
 * @param defaultValue
 * @param jsonParse
 * @returns
 */
async function getSecret<T>({ key, defaultValue, jsonParse = false, path = '/' }: IGetSecretProps<T>): Promise<T> {
    const value = await secretsManager.getSecret(key, path);

    if (value && jsonParse) {
        return JSON.parse(value);
    }

    if (value) {
        return value as T;
    }

    if (defaultValue !== undefined) {
        return defaultValue;
    }

    throw new MissingSecretVarError(`The following secret var is missing: ${key}`);
}

export default getSecret;
