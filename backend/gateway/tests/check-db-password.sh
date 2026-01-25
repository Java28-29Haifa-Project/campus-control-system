#!/bin/bash

# Check Database Password Hashes

DATABASE_URL="$1"

if [ -z "$DATABASE_URL" ]; then
    echo "Usage: ./check-db-passwords.sh 'your-database-url'"
    exit 1
fi

echo "Checking database user passwords..."
echo ""

# Get all users with their password hashes
psql "$DATABASE_URL" -c "
SELECT
    user_id,
    username,
    email,
    LEFT(password_hash, 20) || '...' as password_sample
FROM users
ORDER BY username;
"

echo ""
echo "Password Info:"
echo "- All seed passwords should be: password123"
echo "- Hashes should start with: \$2b\$ (bcrypt)"
echo ""
echo "To reset a password manually:"
echo "psql \"\$DATABASE_URL\" -c \"UPDATE users SET password_hash = '\$2b\$10\$HASH_HERE' WHERE email = 'user@test.org';\""