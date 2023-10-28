import { createClient } from 'redis';
import { getEnvVar } from '../env-utils';

const url = getEnvVar<string>('REDIS_URL', '', false);

const client = createClient({ url });
client.on('error', (err) => console.log('Redis Client Error', err));
client.connect();

export default client;
