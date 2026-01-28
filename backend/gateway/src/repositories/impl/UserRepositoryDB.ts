import { Pool } from 'pg';
import { db } from '../../utils/db.client.js';
import bcrypt from 'bcrypt';
import {IUserRepository} from "../IUserRepository.js";

class UserRepositoryDB implements IUserRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async createUser(name: string, email: string, password: string) {
        const passwordHash = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO users (name, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING user_id AS "userId", name, email, role, created_at AS "createdAt";
        `;
        const result = await this.pool.query(query, [name, email, passwordHash]);
        return result.rows[0];
    }

    async findByEmail(email: string) {
        const query = `SELECT * FROM users WHERE email = $1`;
        const result = await this.pool.query(query, [email]);
        return result.rows[0] || null;
    }
}

export const userRepository = new UserRepositoryDB(db);
