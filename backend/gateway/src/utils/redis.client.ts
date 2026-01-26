import { createClient } from 'redis';
import { redisConfig } from '../configurations/redis-config.js';

const client = createClient({
    socket: {
        host: redisConfig.host,
        port: redisConfig.port
    },
    password: redisConfig.password
});

client.on('error', (err) => console.error('Redis error:', err));
client.on('ready', () => console.log('Connected to Redis'));

client.connect().catch(err => console.error('Redis connection failed:', err));

export async function addToBlacklist(tokenId: string, expirySeconds: number): Promise<void> {
    try {
        await client.setEx(`blacklist:${tokenId}`, expirySeconds, 'revoked');
    } catch (error) {
        console.error('Error blacklisting token:', error);
    }
}

export async function isBlacklisted(tokenId: string): Promise<boolean> {
    try {
        const result = await client.exists(`blacklist:${tokenId}`);
        return result === 1;
    } catch (error) {
        console.error('Error checking blacklist:', error);
        return false;
    }
}

export { client as redisClient };