import axios, { AxiosInstance } from 'axios';
import InfisicalClient from 'infisical-node';
import { getEnvVar } from '../env-utils';
import getEnvName from '../env-utils/get-env-name';
import { InfisicalTokenIsNotProvidedError } from '../exceptions/self-handled-exception';

class SecretsManager {
    private readonly BASE_URL = 'https://app.infisical.com/api/v1/';
    private readonly SECRET_TYPE = 'shared';
    private readonly secretManagerClientSDK: InfisicalClient;
    private readonly apiBase: AxiosInstance;
    private readonly env: string;

    constructor() {
        const INFISICAL_TOKEN = getEnvVar('INFISICAL_TOKEN', '', false);
        if (!INFISICAL_TOKEN) {
            throw new InfisicalTokenIsNotProvidedError();
        }

        this.secretManagerClientSDK = new InfisicalClient({
            token: INFISICAL_TOKEN,
            debug: true,
        });
        this.apiBase = axios.create({
            baseURL: this.BASE_URL,
            headers: { Authorization: `Bearer ${INFISICAL_TOKEN}` },
        });

        this.apiBase.interceptors.request.use(
            (config) => {
                if (['post', 'put', 'patch'].includes(config.method ?? '')) {
                    config.data = {
                        ...config.data,
                        environment: 'dev',
                        workspaceId: '653bb42d95ecb3b28f6c54fe',
                    };
                }
                return config;
            },
            (error) => Promise.reject(error),
        );
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
        const secretInfo = await this.secretManagerClientSDK.getSecret(key, {
            environment: this.env,
            type: this.SECRET_TYPE,
            path,
        });

        return secretInfo.secretValue || '';
    }

    /**
     * create new secret
     * @param name
     * @param value
     * @param path
     * @returns
     */
    private async rawCreateSecret(name: string, value: string, path: string): Promise<void> {
        await this.secretManagerClientSDK.createSecret(name, value, {
            environment: this.env,
            type: this.SECRET_TYPE,
            path,
        });
    }

    /**
     * create new folder
     * @param name
     * @param directory
     * @returns
     */
    async createFolder(name: string, directory: string): Promise<void> {
        await this.apiBase.post('folders', {
            name,
            directory,
        });
    }

    /**
     * create new secret
     * @param name
     * @param value
     * @param path
     * @returns
     */
    async createSecret(name: string, value: string, path: string): Promise<void> {
        const pathSnippets = path.split('/').filter(Boolean);

        if (pathSnippets.length === 0) {
            return this.rawCreateSecret(name, value, path);
        }
        const folderName = pathSnippets.pop() ?? '';
        const folderPath = '/' + pathSnippets.join('/');
        await this.createFolder(folderName, folderPath);
        await this.rawCreateSecret(name, value, path);
    }
}

export default new SecretsManager();
