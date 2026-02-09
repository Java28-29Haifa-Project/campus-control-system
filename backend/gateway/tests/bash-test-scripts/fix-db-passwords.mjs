// fix-db-passwords.mjs
// Run this to fix password hashes in database
// Usage: node fix-db-passwords.mjs

import bcrypt from 'bcrypt';
import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable not set!');
    console.log('\nUsage:');
    console.log('  DATABASE_URL="your-connection-string" node fix-db-passwords.mjs');
    process.exit(1);
}

async function fixPasswords() {
    const client = new pg.Client({ connectionString: DATABASE_URL });
    
    try {
        await client.connect();
        console.log('✓ Connected to database\n');
        
        const password = 'password123';
        const users = [
            { email: 'user@test.org', name: 'User' },
            { email: 'admin@test.org', name: 'Admin' },
            { email: 'support@test.org', name: 'Support' },
            { email: 'engineer@test.org', name: 'Engineer' }
        ];
        
        console.log('Generating new password hashes...\n');
        
        for (const user of users) {
            const hash = await bcrypt.hash(password, 10);
            
            await client.query(
                'UPDATE users SET password_hash = $1 WHERE email = $2',
                [hash, user.email]
            );
            
            console.log(`✓ ${user.name}: ${user.email}`);
            console.log(`  Hash: ${hash.substring(0, 30)}...`);
        }
        
        console.log('\n✓ All passwords updated!\n');
        
        // Verify
        const result = await client.query(
            'SELECT email, LENGTH(password_hash) as hash_length FROM users ORDER BY email'
        );
        
        console.log('Verification:');
        console.table(result.rows);
        
        console.log('\nAll passwords are now: password123');
        console.log('All hashes should be 60 characters long.\n');
        
    } catch (error) {
        console.error('ERROR:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

fixPasswords();
