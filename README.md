# campus-control-system
Fullstack development course student's final project

## Overview
Short description of the system, its purpose and target users.

## High-Level Architecture
- AWS-based serverless architecture
- API Gateway + Lambda functions
- React frontend
- Monorepo structure

## Repository Structure
- /backend   – shared backend logic, schemas, utilities
- /frontend  – React application
- /lambdas   – AWS Lambda services (microservices)
- LICENSE
- README.md

## Main Features
- Authentication and authorization (JWT, roles)
- User requests (tickets)
- Incident management
- Monitoring and auditing
- Notifications (Email / SMS)

## User Roles
- USER
- SUPPORT
- ENGINEER
- ADMIN

## Tech Stack
- Frontend: React, TypeScript
- Backend: Node.js / AWS Lambda
- Infrastructure: AWS API Gateway, SNS, CloudWatch
- Auth: JWT (stored in cookies)

## Getting Started
High-level instructions:
- Prerequisites
- Local setup (links to sub-readmes)

## Documentation
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Lambdas README](./lambdas/README.md)

## Contribution Guidelines
Basic rules for branches, commits, PRs.

## License
MIT (or other)