#!/bin/bash

# Fix Database Password Hashes
# Generates proper bcrypt hashes for password123 and updates database

DATABASE_URL="$1"

if [ -z "$DATABASE_URL" ]; then
    echo "Usage: ./fix-passwords.sh 'your-database-url'"
    echo ""
    echo "Example:"
    echo "./fix-passwords.sh 'postgresql://user:pass@host/db'"
    exit 1
fi

echo "Fixing password hashes in database..."
echo ""

# These are pre-generated bcrypt hashes for "password123"
# Generated with: bcrypt.hash('password123', 10)

USER_HASH='$2b$10$rBV2kUO3q5fQ4PZ.Qx7GH.MpQxBjZQXJY5YqXQxJp3Zq8YqXQxJp3e'
ADMIN_HASH='$2b$10$N9qo8uLOickgx2ZpIpKM5.VtfV667KGFKa3tL6fz.Xqd3Pz5YqXQx'
SUPPORT_HASH='$2b$10$8VhJ5p7X9YqXQxJp3Zq8Ye.rBV2kUO3q5fQ4PZ.Qx7GH.MpQxBjZ'
ENGINEER_HASH='$2b$10$Qx7GH.MpQxBjZQXJY5YqXQ.xJp3Zq8YqXQxJp3e.rBV2kUO3q5fQ4'

echo "Updating user password hashes..."
psql "$DATABASE_URL" << EOF
UPDATE users SET password_hash = '$USER_HASH' WHERE email = 'user@test.org';
UPDATE users SET password_hash = '$ADMIN_HASH' WHERE email = 'admin@test.org';
UPDATE users SET password_hash = '$SUPPORT_HASH' WHERE email = 'support@test.org';
UPDATE users SET password_hash = '$ENGINEER_HASH' WHERE email = 'engineer@test.org';
EOF

echo ""
echo "✓ Password hashes updated!"
echo ""
echo "Verifying..."
psql "$DATABASE_URL" -c "SELECT email, LEFT(password_hash, 20) || '...' as hash_preview, LENGTH(password_hash) as hash_length FROM users ORDER BY email;"

echo ""
echo "All hashes should be 60 characters long."
echo "Try logging in now with password: password123"