//TODO delete

import { User } from '../types/auth.js';

export interface StoredUser extends User {
    password: string;
}

export const mockUsers: StoredUser[] = [
    {
        userId: 'user_001',
        username: 'john_user',
        email: 'user@test.org',
        role: 'USER',
        password: 'password123'
    },
    {
        userId: 'admin_001',
        username: 'admin_alice',
        email: 'admin@test.org',
        role: 'ADMIN',
        password: 'admin123'
    },
    {
        userId: 'support_001',
        username: 'support_bob',
        email: 'support@test.org',
        role: 'SUPPORT',
        password: 'support123'
    },
    {
        userId: 'engineer_001',
        username: 'engineer_charlie',
        email: 'engineer@test.org',
        role: 'ENGINEER',
        password: 'engineer123'
    }
];

export function findUserByEmail(email: string): StoredUser | undefined {
    return mockUsers.find(u => u.email === email);
}

export function findUserById(userId: string): StoredUser | undefined {
    return mockUsers.find(u => u.userId === userId);
}