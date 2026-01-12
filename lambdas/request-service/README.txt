REQUEST SERVICE
AWS Lambda (Java)
EOSM Project

==================================================

OVERVIEW

Request Service is a minimal Java-based microservice implemented as an AWS Lambda function.
It is responsible for handling user requests (tickets) within the EOSM (Enterprise Observability & Service Management) system.

The service is designed as a synchronous backend component that is invoked by a Gateway service and does not expose endpoints directly to the frontend.

At the current stage:

No database is used

No asynchronous messaging is used

The service demonstrates a complete Gateway → Lambda → Response flow

==================================================

ARCHITECTURAL ROLE

The Request Service participates in the following request flow:

Frontend
→ Gateway Service (Node.js)
→ Request Service (AWS Lambda, Java)
→ JSON response back to Gateway

Responsibilities of the Request Service:

Validate incoming commands

Route requests based on the "action" field

Execute business logic related to request creation

Return a unified response format

==================================================

TECHNOLOGY STACK

Java 

AWS Lambda (RequestStreamHandler)

Maven

Jackson (JSON serialization)

==================================================


REQUEST PROCESSING FLOW

Gateway sends a JSON request containing an "action" field

AWS Lambda is invoked synchronously

RequestLambdaHandler:

reads the input stream

deserializes the GatewayRequest

validates the action

delegates processing to the corresponding Action class

A GatewayResponse object is created

The response is serialized and returned to the Gateway

==================================================

GATEWAY → LAMBDA CONTRACT

Input JSON example:

{
"action": "CREATE_REQUEST",
"payload": {
"category": "plumbing",
"subject": "subject0",
"description": "desc0",
"userReportedPriority": "high"
}
}

==================================================

LAMBDA → GATEWAY RESPONSE

Successful response example:

{
"ok": true,
"data": {
"requestId": "req-123",
"requestNumber": "REQ-1700000000000",
"category": "plumbing",
"subject": "subject0",
"description": "desc0",
"userReportedPriority": "high",
"status": "new",
"createdAt": "2026-01-05T12:00:00Z"
}
}

Error response example:

{
"ok": false,
"error": {
"code": "BAD_REQUEST",
"message": "Missing action"
}
}

==================================================

SUPPORTED ACTIONS

CREATE_REQUEST
Creates a new user request (ticket)

==================================================

CORE COMPONENTS

RequestLambdaHandler
The AWS Lambda entry point.
Responsible for:

input stream handling

error handling

action routing

CreateRequestAction
Encapsulates business logic for creating requests.
Allows future extension without modifying the Lambda handler.

GatewayRequest
DTO representing input data received from the Gateway.

GatewayResponse
Unified response wrapper:

ok = true → data

ok = false → error

==================================================

BUILD INSTRUCTIONS

Build the project using Maven:

mvn clean package

The resulting JAR file will be created in the "target" directory.

==================================================

DEPLOYMENT (MVP)

Create an AWS Lambda function

Runtime: Java 8

Handler:
com.eosm.request.handler.RequestLambdaHandler::handleRequest

Upload the built JAR file

==================================================

FUTURE IMPROVEMENTS

Database integration (PostgreSQL or DynamoDB)

Audit and notification services

Asynchronous event processing

Migration to Java 17

Strong DTO validation

Integration with incident management services

==================================================

NOTES

This service is intentionally minimal and serves as a foundational building block for a larger microservice-based system.
The Gateway and Lambda are loosely coupled through a clearly defined contract.