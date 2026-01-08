# AWS Accounts Registry

This file defines all AWS accounts participating in the project
and how their services integrate with the central HTTP API (hub account).

---

## Hub Account

| Field        | Value                          |
|-------------|--------------------------------|
| purpose     | Central HTTP API + Frontend    |
| account_id  | 123456789012                   |
| region      | eu-central-1                   |
| api_id      | a1b2c3d4e5                     |
| owner       | Max                            |

---

## Service: auth

| Field        | Value                          |
|-------------|--------------------------------|
| service     | auth                           |
| account_id  | 210987654321                   |
| region      | eu-central-1                   |
| lambda_name | auth-service                   |
| lambda_arn  | arn:aws:lambda:eu-central-1:210987654321:function:auth-service |
| owner       | Team Auth                      |

---

## Service: users

| Field        | Value                          |
|-------------|--------------------------------|
| service     | users                          |
| account_id  | 345678901234                   |
| region      | eu-central-1                   |
| lambda_name | users-service                  |
| lambda_arn  | arn:aws:lambda:eu-central-1:345678901234:function:users-service |
| owner       | Team Users                     |

---

## Service: core

| Field        | Value                          |
|-------------|--------------------------------|
| service     | core                           |
| account_id  | 456789012345                   |
| region      | eu-central-1                   |
| lambda_name | core-service                   |
| lambda_arn  | arn:aws:lambda:eu-central-1:456789012345:function:core-service |
| owner       | Team Core                      |
