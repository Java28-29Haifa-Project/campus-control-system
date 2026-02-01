@echo off
REM ============================================================================
REM Express Gateway API Test
REM ============================================================================


setlocal enabledelayedexpansion

REM Configuration
set BASE_URL=http://localhost:8080
set COOKIES_FILE=cookies.txt

REM Colors for output (Windows 10+)
set COLOR_GREEN=[92m
set COLOR_RED=[91m
set COLOR_YELLOW=[93m
set COLOR_RESET=[0m

echo.
echo ============================================================================
echo            EXPRESS GATEWAY API TEST SCRIPT
echo ============================================================================
echo.
echo Base URL: %BASE_URL%
echo.

REM ============================================================================
REM 0. Health Check
REM ============================================================================
echo.
echo %COLOR_YELLOW%[TEST 0] Health Check%COLOR_RESET%
echo ----------------------------------------------------------------------------
curl -s -X GET %BASE_URL%/health
if !errorlevel! == 0 (
    echo %COLOR_GREEN%✓ Health check passed%COLOR_RESET%
) else (
    echo %COLOR_RED%✗ Health check failed%COLOR_RESET%
    goto :error
)

REM ============================================================================
REM 1. Authentication Tests
REM ============================================================================
echo.
echo.
echo %COLOR_YELLOW%[TEST 1] Login as USER%COLOR_RESET%
echo ----------------------------------------------------------------------------
curl -s -X POST %BASE_URL%/auth/login ^
  -H "Content-Type: application/json" ^
  -c %COOKIES_FILE% ^
  -d "{\"email\":\"user@test.org\",\"password\":\"password123\"}"

if !errorlevel! == 0 (
    echo %COLOR_GREEN%✓ Login successful%COLOR_RESET%
) else (
    echo %COLOR_RED%✗ Login failed%COLOR_RESET%
    goto :error
)

echo.
echo %COLOR_YELLOW%[TEST 2] Get Current User%COLOR_RESET%
echo ----------------------------------------------------------------------------
curl -s -X GET %BASE_URL%/auth/me ^
  -b %COOKIES_FILE%

REM ============================================================================
REM 2. Request (Ticket) Tests
REM ============================================================================
echo.
echo.
echo %COLOR_YELLOW%[TEST 3] Create Request (Ticket)%COLOR_RESET%
echo ----------------------------------------------------------------------------
curl -s -X POST %BASE_URL%/requests ^
  -H "Content-Type: application/json" ^
  -b %COOKIES_FILE% ^
  -d "{\"category\":\"network\",\"subject\":\"Wi-Fi not working in office\",\"description\":\"Cannot connect to wi-fi access point\",\"userReportedPriority\":\"high\"}"

echo.
echo %COLOR_YELLOW%[TEST 4] Get All Requests%COLOR_RESET%
echo ----------------------------------------------------------------------------
curl -s -X GET %BASE_URL%/requests ^
  -b %COOKIES_FILE%

echo.
echo %COLOR_YELLOW%[TEST 5] Filter Requests by Status%COLOR_RESET%
echo ----------------------------------------------------------------------------
curl -s -X GET "%BASE_URL%/requests?status=new" ^
  -b %COOKIES_FILE%

echo.
echo %COLOR_YELLOW%[TEST 6] Filter Requests by Category%COLOR_RESET%
echo ----------------------------------------------------------------------------
curl -s -X GET "%BASE_URL%/requests?category=network" ^
  -b %COOKIES_FILE%

echo.
echo %COLOR_YELLOW%[TEST 7] Filter Requests by Date%COLOR_RESET%
echo ----------------------------------------------------------------------------
curl -s -X GET "%BASE_URL%/requests?dateFrom=2026-01-01&dateTo=2026-12-31" ^
  -b %COOKIES_FILE%

REM ============================================================================
REM 3. Login as SUPPORT for Incident Tests
REM ============================================================================
echo.
echo.
echo %COLOR_YELLOW%[TEST 8] Logout and Login as SUPPORT%COLOR_RESET%
echo ----------------------------------------------------------------------------
curl -s -X POST %BASE_URL%/auth/logout ^
  -b %COOKIES_FILE%

curl -s -X POST %BASE_URL%/auth/login ^
  -H "Content-Type: application/json" ^
  -c %COOKIES_FILE% ^
  -d "{\"email\":\"support@test.org\",\"password\":\"support123\"}"

REM ============================================================================
REM 4. Incident Tests (SUPPORT)
REM ============================================================================
echo.
echo.
echo %COLOR_YELLOW%[TEST 9] Create Incident%COLOR_RESET%
echo ----------------------------------------------------------------------------
curl -s -X POST %BASE_URL%/incidents ^
  -H "Content-Type: application/json" ^
  -b %COOKIES_FILE% ^
  -d "{\"ticketIds\":[\"req_001\"],\"impact\":\"high\",\"urgency\":\"high\",\"category\":\"network\",\"description\":\"Multiple users affected\"}"

echo.
echo %COLOR_YELLOW%[TEST 10] Get All Incidents%COLOR_RESET%
echo ----------------------------------------------------------------------------
curl -s -X GET %BASE_URL%/incidents ^
  -b %COOKIES_FILE%

echo.
echo %COLOR_YELLOW%[TEST 11] Filter Incidents by Priority%COLOR_RESET%
echo ----------------------------------------------------------------------------
curl -s -X GET "%BASE_URL%/incidents?priority=1" ^
  -b %COOKIES_FILE%

REM ============================================================================
REM 5. Login as ENGINEER for Engineer Tests
REM ============================================================================
echo.
echo.
echo %COLOR_YELLOW%[TEST 12] Logout and Login as ENGINEER%COLOR_RESET%
echo ----------------------------------------------------------------------------
curl -s -X POST %BASE_URL%/auth/logout ^
  -b %COOKIES_FILE%

curl -s -X POST %BASE_URL%/auth/login ^
  -H "Content-Type: application/json" ^
  -c %COOKIES_FILE% ^
  -d "{\"email\":\"engineer@test.org\",\"password\":\"engineer123\"}"

REM ============================================================================
REM 6. Engineer Tests
REM ============================================================================
echo.
echo.
echo %COLOR_YELLOW%[TEST 13] Assign Incident to Self%COLOR_RESET%
echo ----------------------------------------------------------------------------
REM Note: Replace inc_001 with actual incident ID from test 9
curl -s -X PATCH %BASE_URL%/incidents/inc_new_001/assign ^
  -b %COOKIES_FILE%

echo.
echo %COLOR_YELLOW%[TEST 14] Update Incident Status%COLOR_RESET%
echo ----------------------------------------------------------------------------
curl -s -X PATCH %BASE_URL%/incidents/inc_new_001/status ^
  -H "Content-Type: application/json" ^
  -b %COOKIES_FILE% ^
  -d "{\"status\":\"in_progress\",\"comment\":\"Working on it\"}"

echo.
echo %COLOR_YELLOW%[TEST 15] Raise Incident Priority%COLOR_RESET%
echo ----------------------------------------------------------------------------
curl -s -X PATCH %BASE_URL%/incidents/inc_new_001/priority ^
  -H "Content-Type: application/json" ^
  -b %COOKIES_FILE% ^
  -d "{\"priority\":1,\"comment\":\"Escalating\"}"

REM ============================================================================
REM 7. Validation Error Tests
REM ============================================================================
echo.
echo.
echo %COLOR_YELLOW%[TEST 16] Test Validation Error (Invalid Category)%COLOR_RESET%
echo ----------------------------------------------------------------------------
curl -s -X POST %BASE_URL%/auth/login ^
  -H "Content-Type: application/json" ^
  -c %COOKIES_FILE% ^
  -d "{\"email\":\"user@test.org\",\"password\":\"password123\"}"

curl -s -X POST %BASE_URL%/requests ^
  -H "Content-Type: application/json" ^
  -b %COOKIES_FILE% ^
  -d "{\"category\":\"invalid_category\",\"subject\":\"Test\",\"userReportedPriority\":\"high\"}"

echo.
echo %COLOR_YELLOW%Expected: 400 Validation Error%COLOR_RESET%

echo.
echo %COLOR_YELLOW%[TEST 17] Test Validation Error (Short Subject)%COLOR_RESET%
echo ----------------------------------------------------------------------------
curl -s -X POST %BASE_URL%/requests ^
  -H "Content-Type: application/json" ^
  -b %COOKIES_FILE% ^
  -d "{\"category\":\"network\",\"subject\":\"Short\",\"userReportedPriority\":\"high\"}"

echo.
echo %COLOR_YELLOW%Expected: 400 Validation Error%COLOR_RESET%

REM ============================================================================
REM 8. Access Control Tests
REM ============================================================================
echo.
echo.
echo %COLOR_YELLOW%[TEST 18] Test Forbidden Access (USER trying incidents)%COLOR_RESET%
echo ----------------------------------------------------------------------------
curl -s -X GET %BASE_URL%/incidents ^
  -b %COOKIES_FILE%

echo.
echo %COLOR_YELLOW%Expected: 403 Forbidden%COLOR_RESET%

REM ============================================================================
REM 9. Cleanup
REM ============================================================================
echo.
echo.
echo %COLOR_YELLOW%[TEST 19] Logout%COLOR_RESET%
echo ----------------------------------------------------------------------------
curl -s -X POST %BASE_URL%/auth/logout ^
  -b %COOKIES_FILE%

REM ============================================================================
REM Summary
REM ============================================================================
echo.
echo.
echo ============================================================================
echo                            TEST SUMMARY
echo ============================================================================
echo %COLOR_GREEN%All tests completed!%COLOR_RESET%
echo.
echo Review the output above for any errors or unexpected responses.
echo.
echo To clean up:
echo   - Delete %COOKIES_FILE%
echo.
goto :end

:error
echo.
echo %COLOR_RED%Error: Tests failed!%COLOR_RESET%
echo Check the server is running at %BASE_URL%
goto :end

:end
if exist %COOKIES_FILE% del %COOKIES_FILE%
echo.
echo ============================================================================
pause