#!/bin/bash

# Express Gateway Test Script - CORRECTED EXPECTATIONS
# Some tests will fail because Lambda doesn't exist yet - this is EXPECTED

BASE_URL="http://localhost:8080"
COOKIES="cookies.txt"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "====================================="
echo "Express Gateway API Test Suite"
echo "====================================="
echo ""
echo "NOTE: Some Lambda-related tests will fail (expected)"
echo ""

test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_code=$4
    local description=$5
    local is_expected_fail=$6

    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" -b $COOKIES)
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" \
            -b $COOKIES -c $COOKIES)
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" == "$expected_code" ]; then
        echo -e "${GREEN}✓ PASS${NC}: $description (HTTP $http_code)"
        return 0
    else
        if [ "$is_expected_fail" == "yes" ]; then
            echo -e "${YELLOW}⚠ EXPECTED FAIL${NC}: $description (Got $http_code - Lambda doesn't exist)"
        else
            echo -e "${RED}✗ FAIL${NC}: $description (Expected $expected_code, got $http_code)"
            echo "Response: $body"
        fi
        return 1
    fi
}

echo "1. HEALTH CHECKS"
echo "----------------"
test_endpoint "GET" "/health" "" "200" "Gateway health check"
test_endpoint "GET" "/health/lambdas/request" "" "200" "Request Lambda health" "yes"
echo ""

echo "2. AUTHENTICATION TESTS"
echo "-----------------------"

test_endpoint "POST" "/auth/login" \
    '{"email":"user@test.org","password":"password123"}' \
    "200" "Login as USER"

test_endpoint "GET" "/auth/me" "" "200" "Get current user info"

test_endpoint "POST" "/auth/login" \
    '{"email":"wrong@test.org","password":"wrong"}' \
    "401" "Login with invalid credentials"

test_endpoint "POST" "/auth/login" \
    '{"email":"notanemail","password":"123"}' \
    "400" "Login with invalid email format"

echo ""

echo "3. REQUESTS (TICKETS) TESTS"
echo "----------------------------"

test_endpoint "GET" "/requests" "" "200" "Get all requests (USER sees own)"

test_endpoint "GET" "/requests?status=new" "" "200" "Get requests with status=new"

test_endpoint "POST" "/requests" \
    '{"category":"plumbing","subject":"Leaking faucet needs urgent repair","userReportedPriority":"high"}' \
    "201" "Create new request (USER only)" "yes"

test_endpoint "POST" "/requests" \
    '{"category":"plumbing","subject":"Short","userReportedPriority":"low"}' \
    "400" "Validation error - subject too short"

test_endpoint "POST" "/requests" \
    '{"category":"invalid","subject":"This should fail validation","userReportedPriority":"low"}' \
    "400" "Validation error - invalid category"

echo ""

echo "4. RBAC TESTS"
echo "-------------"

test_endpoint "GET" "/incidents" "" "403" "USER cannot access incidents (403)"

test_endpoint "GET" "/monitoring/logs" "" "403" "USER cannot access monitoring (403)"

test_endpoint "POST" "/audit" \
    '{"eventType":"TEST","actor":"test","action":"TEST","entityType":"test","entityId":"test","timestamp":"2026-01-25T00:00:00Z"}' \
    "403" "USER cannot access audit (403)"

echo ""

echo "5. LOGIN AS SUPPORT"
echo "-------------------"
test_endpoint "POST" "/auth/login" \
    '{"email":"support@test.org","password":"password123"}' \
    "200" "Login as SUPPORT"

test_endpoint "GET" "/incidents" "" "200" "SUPPORT can access incidents" "yes"

test_endpoint "GET" "/monitoring/logs" "" "403" "SUPPORT cannot access monitoring (403)"

echo ""

echo "6. LOGIN AS ADMIN"
echo "-----------------"
test_endpoint "POST" "/auth/login" \
    '{"email":"admin@test.org","password":"password123"}' \
    "200" "Login as ADMIN"

test_endpoint "GET" "/incidents" "" "200" "ADMIN can access incidents" "yes"
test_endpoint "GET" "/monitoring/logs" "" "200" "ADMIN can access monitoring" "yes"
test_endpoint "GET" "/monitoring/alarms" "" "200" "ADMIN can access alarms" "yes"

echo ""

echo "7. RATE LIMITING TEST"
echo "---------------------"
echo "Testing auth rate limit (max 5 per 15 min)..."

for i in {1..6}; do
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"test@test.org","password":"wrong"}')

    http_code=$(echo "$response" | tail -n1)

    if [ $i -le 5 ]; then
        if [ "$http_code" == "401" ]; then
            echo -e "${GREEN}✓${NC} Request $i: Got 401 (expected)"
        else
            echo -e "${YELLOW}⚠${NC} Request $i: Got $http_code (if 429, Redis not cleared)"
        fi
    else
        if [ "$http_code" == "429" ]; then
            echo -e "${GREEN}✓${NC} Request $i: Got 429 - Rate limited! (expected)"
        else
            echo -e "${YELLOW}⚠${NC} Request $i: Got $http_code (expected 429)"
        fi
    fi

    sleep 0.5
done

echo ""

echo "8. TOKEN REFRESH TEST"
echo "---------------------"

curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"user@test.org","password":"password123"}' \
    -c $COOKIES > /dev/null

test_endpoint "POST" "/auth/refresh" "" "200" "Refresh tokens"

test_endpoint "GET" "/auth/me" "" "200" "Verify refreshed token works"

echo ""

echo "9. LOGOUT TEST"
echo "--------------"
test_endpoint "POST" "/auth/logout" "" "200" "Logout (blacklist token)"

test_endpoint "GET" "/auth/me" "" "401" "Token invalid after logout"

echo ""

echo "====================================="
echo "TEST SUITE COMPLETE"
echo "====================================="

rm -f $COOKIES

echo ""
echo -e "${YELLOW}EXPECTED FAILURES:${NC}"
echo "  - Lambda health endpoints (404) - Lambda not deployed"
echo "  - Create/Update requests via Lambda (503) - Lambda not deployed"
echo "  - Incidents endpoints - Lambda not deployed"
echo "  - Monitoring endpoints - Lambda not deployed"
echo ""
echo -e "${GREEN}WHAT SHOULD WORK:${NC}"
echo "  ✓ Health check (Express)"
echo "  ✓ Authentication (all roles)"
echo "  ✓ Get requests (from database)"
echo "  ✓ Validation"
echo "  ✓ RBAC (403 errors)"
echo "  ✓ Rate limiting"
echo "  ✓ Token refresh/logout"
echo ""