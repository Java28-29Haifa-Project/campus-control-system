// debug-login.mjs
// Test password verification directly
import bcrypt from 'bcrypt';
import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

async function debugLogin() {
    const client = new pg.Client({ connectionString: DATABASE_URL });
    
    try {
        await client.connect();
        console.log('✓ Connected to database\n');
        
        // Get admin user
        const result = await client.query(
            'SELECT user_id, username, email, password_hash, role FROM users WHERE email = $1',
            ['admin@test.org']
        );
        
        if (result.rows.length === 0) {
            console.log('User not found!');
            return;
        }
        
        const user = result.rows[0];
        console.log('User found:');
        console.log('  ID:', user.user_id);
        console.log('  Username:', user.username);
        console.log('  Email:', user.email);
        console.log('  Role:', user.role);
        console.log('  Hash (first 30):', user.password_hash.substring(0, 30) + '...');
        console.log('  Hash length:', user.password_hash.length);
        console.log();
        
        // Test password
        const password = 'password123';
        console.log(`Testing password: "${password}"`);
        
        const isValid = await bcrypt.compare(password, user.password_hash);
        
        if (isValid) {
            console.log('PASSWORD MATCHES!');
            console.log('\nThe hash is correct and bcrypt comparison works.');
            console.log('Problem must be in the auth controller code.');
        } else {
            console.log('PASSWORD DOES NOT MATCH!');
            console.log('\nThe hash in database is still wrong or corrupt.');
        }
        
    } catch (error) {
        console.error('ERROR:', error.message);
    } finally {
        await client.end();
    }
}

debugLogin();
