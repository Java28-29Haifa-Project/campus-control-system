#!/bin/bash

BASE_URL="http://localhost:8080"
COOKIE_FILE="cookies.txt"

echo ""
echo "========================================"
echo " TESTING EXPRESS GATEWAY WITH JWT"
echo "========================================"
echo ""

# Clean up
rm -f $COOKIE_FILE

# Test 1: Health
echo " Test 1: Gateway Health (Public)"
curl -s "$BASE_URL/health"
echo ""
sleep 1

# Test 2: Lambda health
echo ""
echo " Test 2: Auth Lambda Health"
curl -s "$BASE_URL/health/lambdas/auth"
echo ""
sleep 1

# Test 3: Unauthorized
echo ""
echo " Test 3: Unauthorized Access (Should Fail)"
curl -s "$BASE_URL/requests"
echo ""
sleep 1

# Test 4: Login
echo ""
echo " Test 4: Login as USER"
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.org","password":"password123"}' \
  -c $COOKIE_FILE \
  -s
echo ""
sleep 1

# Test 5: Get me
echo ""
echo " Test 5: Get Current User"
curl "$BASE_URL/auth/me" \
  -b $COOKIE_FILE \
  -s
echo ""
sleep 1

# Test 6: Get requests
echo ""
echo " Test 6: Get Requests (USER - filtered)"
curl "$BASE_URL/requests" \
  -b $COOKIE_FILE \
  -s
echo ""
sleep 1

# Test 7: Access admin (fail)
echo ""
echo " Test 7: Access Admin Endpoint (Should Fail 403)"
curl "$BASE_URL/monitoring/logs" \
  -b $COOKIE_FILE \
  -s
echo ""
sleep 1

# Test 8: Refresh
echo ""
echo " Test 8: Refresh Token"
curl -X POST "$BASE_URL/auth/refresh" \
  -b $COOKIE_FILE \
  -c $COOKIE_FILE \
  -s
echo ""
sleep 1

# Test 9: Logout
echo ""
echo " Test 9: Logout (Blacklist)"
curl -X POST "$BASE_URL/auth/logout" \
  -b $COOKIE_FILE \
  -s
echo ""

# MANUALLY DELETE COOKIES (simulates browser behavior)
rm -f $COOKIE_FILE

sleep 1

# Test 10: Use after logout
echo ""
echo " Test 10: Use Token After Logout (Should Fail)"
curl "$BASE_URL/auth/me" \
  -b $COOKIE_FILE \
  -s
echo ""
sleep 1

# Test 11: Login as ADMIN
echo ""
echo " Test 11: Login as ADMIN"
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.org","password":"admin123"}' \
  -c $COOKIE_FILE \
  -s
echo ""
sleep 1

# Test 12: Access admin (success)
echo ""
echo " Test 12: Access Admin Endpoint (Should Work)"
curl "$BASE_URL/monitoring/logs" \
  -b $COOKIE_FILE \
  -s
echo ""

echo ""
echo "========================================"
echo " TESTS COMPLETED!"
echo "========================================"
echo ""

# Cleanup
rm -f $COOKIE_FILE