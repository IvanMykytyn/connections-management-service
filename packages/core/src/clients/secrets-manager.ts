import InfisicalClient from 'infisical-node';
import { getEnvVar } from '../env-utils';
import getEnvName from '../env-utils/get-env-name';
import { InfisicalTokenIsNotProvidedError } from '../exceptions/self-handled-exception';

class SecretsManager {
    private readonly SECRET_TYPE = 'shared';
    private readonly secretManagerClient: InfisicalClient;
    private readonly env: string;

    constructor() {
        const INFISICAL_TOKEN = getEnvVar('INFISICAL_TOKEN', '', false);
        if (!INFISICAL_TOKEN) {
            throw new InfisicalTokenIsNotProvidedError();
        }

        this.secretManagerClient = new InfisicalClient({
            token: INFISICAL_TOKEN,
            debug: true,
        });
        this.env = getEnvName();
    }

    /**
     * Get secret value
     *
     * @param key
     * @param path
     * @returns
     */
    async getSecret(key: string, path: string): Promise<string> {
        const secretInfo = await this.secretManagerClient.getSecret(key, {
            environment: this.env,
            type: this.SECRET_TYPE,
            path,
        });
        console.log(secretInfo);

        return secretInfo.secretValue || '';
    }

    /**
     * create new secret
     * @param name
     * @param value
     * @param path
     * @returns
     */
    async createSecret(name: string, value: string, path: string): Promise<void> {
        await this.secretManagerClient.createSecret(name, value, {
            environment: this.env,
            type: this.SECRET_TYPE,
            path,
        });
    }
}

export default new SecretsManager();
