import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { jwtConfig } from '../configurations/jwt-config.js';
import { AccessTokenPayload, RefreshTokenPayload, TokenPair } from '../types/jwt.js';
import { User } from '../types/auth.js';
import { redisClient } from './redis.client.js';

export class JwtUtils {

    static generateTokenPair(user: User): TokenPair {
        const accessTokenPayload: AccessTokenPayload = {
            userId: user.userId,
            username: user.username,
            email: user.email,
            role: user.role,
            type: 'access'
        };

        const refreshTokenPayload: RefreshTokenPayload = {
            userId: user.userId,
            tokenId: uuidv4(),
            type: 'refresh'
        };

        const accessToken = jwt.sign(
            accessTokenPayload,
            jwtConfig.accessTokenSecret,
            { expiresIn: jwtConfig.accessTokenExpiry } as SignOptions
        );

        const refreshToken = jwt.sign(
            refreshTokenPayload,
            jwtConfig.refreshTokenSecret,
            { expiresIn: jwtConfig.refreshTokenExpiry } as SignOptions
        );

        return { accessToken, refreshToken };
    }

    static verifyAccessToken(token: string): AccessTokenPayload {
        return jwt.verify(token, jwtConfig.accessTokenSecret) as AccessTokenPayload;
    }

    static verifyRefreshToken(token: string): RefreshTokenPayload {
        return jwt.verify(token, jwtConfig.refreshTokenSecret) as RefreshTokenPayload;
    }

    static async blacklistRefreshToken(token: string): Promise<void> {
        try {
            const decoded = this.verifyRefreshToken(token);
            const exp = (jwt.decode(token) as any).exp;
            const now = Math.floor(Date.now() / 1000);
            const ttl = exp - now;

            if (ttl > 0) {
                await redisClient.addToBlacklist(decoded.tokenId, ttl);
            }
        } catch (error) {
            console.error('Error blacklisting token:', error);
        }
    }

    static async isTokenBlacklisted(token: string): Promise<boolean> {
        try {
            const decoded = this.verifyRefreshToken(token);
            return await redisClient.isBlacklisted(decoded.tokenId);
        } catch {
            return false;
        }
    }

    static getTokenExpiry(token: string): number {
        const decoded = jwt.decode(token) as any;
        return decoded.exp;
    }
}