#!/bin/bash

# Clear Redis Rate Limits Before Testing


# Get Redis connection from .env or use defaults
REDIS_HOST=${REDIS_HOST:-"redis-10457.c62.us-east-1-4.ec2.cloud.redislabs.com"}
REDIS_PORT=${REDIS_PORT:-10457}
REDIS_PASSWORD=${REDIS_PASSWORD:-"your-password"}

echo "Clearing Redis rate limit state..."
echo ""

# Test connection first
echo "Testing Redis connection..."
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" PING 2>/dev/null

if [ $? -ne 0 ]; then
    echo "ERROR: Cannot connect to Redis!"
    echo "Please edit this script and set:"
    echo "  REDIS_HOST=\"your-redis-host.cloud.redislabs.com\""
    echo "  REDIS_PASSWORD=\"your-password\""
    exit 1
fi

echo "✓ Connected to Redis"
echo ""

# Clear rate limit keys
echo "Deleting rate limit keys (rl:*)..."
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" --scan --pattern "rl:*" 2>/dev/null | \
    xargs -r redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" DEL 2>/dev/null

# Clear blacklist keys
echo "Deleting blacklist keys (blacklist:*)..."
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" --scan --pattern "blacklist:*" 2>/dev/null | \
    xargs -r redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" DEL 2>/dev/null

echo ""
echo "✓ Redis cleared! Safe to run tests now."
echo ""

# Show remaining keys
KEY_COUNT=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" DBSIZE 2>/dev/null | grep -o '[0-9]*')
echo "Remaining keys in Redis: $KEY_COUNT"