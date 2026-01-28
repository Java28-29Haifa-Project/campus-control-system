import { User } from '../types/auth.js';

export interface IUserRepository {
    createUser(name: string, email: string, password: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
}
