class MissingEnvNameError extends Error {}
class UnknownEnvNameError extends Error {}

const ALLOWED_ENVS = new Set(['dev', 'prod']);

/**
 * Get the env name
 * @param key
 * @returns
 */
const getEnvName = (key: string = 'NODE_ENV') => {
    const envName = process.env[key];

    if (!envName) {
        throw new MissingEnvNameError('Env name is missing, set ENV env var');
    }

    if (!ALLOWED_ENVS.has(envName)) {
        throw new UnknownEnvNameError(`The following env is not in the allow list: ${envName}`);
    }

    return envName;
};

export default getEnvName;
