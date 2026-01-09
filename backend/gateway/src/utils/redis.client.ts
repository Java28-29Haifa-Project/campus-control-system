import { createClient } from 'redis';
import { redisConfig } from '../configurations/redis-config.js';

class RedisClient {
    private client;
    private isConnected = false;

    constructor() {
        this.client = createClient({
            socket: {
                host: redisConfig.host,
                port: redisConfig.port
            },
            password: redisConfig.password
        });

        this.client.on('error', (err) => console.error('Redis Client Error', err));
        this.client.on('connect', () => {
            console.log('Connected to Redis Cloud');
            this.isConnected = true;
        });
    }

    async connect() {
        if (!this.isConnected) {
            await this.client.connect();
        }
    }

    async addToBlacklist(tokenId: string, expirySeconds: number): Promise<void> {
        await this.connect();
        await this.client.setEx(`blacklist:${tokenId}`, expirySeconds, 'revoked');
        console.log(`Token ${tokenId} added to blacklist (TTL: ${expirySeconds}s)`);
    }

    async isBlacklisted(tokenId: string): Promise<boolean> {
        await this.connect();
        const result = await this.client.exists(`blacklist:${tokenId}`);
        return result === 1;
    }

    async disconnect() {
        if (this.isConnected) {
            await this.client.disconnect();
            this.isConnected = false;
        }
    }
}

export const redisClient = new RedisClient();