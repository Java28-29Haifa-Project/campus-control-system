# Frontend ↔ API Gateway Communication

## Protocols, Security, and Multi-Account Architecture

This document explains how frontend applications communicate with AWS API Gateway in a multi-account setup, which protocols are used, and why HTTPS is mandatory.

---

## 1. Transport Protocol

All communication between Frontend (Browser / SPA) and AWS API Gateway uses:

- HTTPS only
- HTTP/1.1 or HTTP/2 over TLS 1.2+
- JSON over REST (or WebSocket API in special cases)

Public API Gateway endpoints are always HTTPS:

https://{api-id}.execute-api.{region}.amazonaws.com

It is not possible to expose a public HTTP (non-TLS) endpoint via API Gateway.

---

## 2. Is HTTP Possible at All?

### Technically
HTTP can exist only inside private networks:
- EC2 ↔ EC2 inside a VPC
- Internal ALB ↔ EC2
- Service-to-service traffic without browser involvement

### Frontend + Browser scenario
HTTP is not usable:
- Browsers block mixed content (https → http)
- Secure cookies are not sent over HTTP
- JWT/session tokens over HTTP are insecure
- API Gateway does not expose public HTTP endpoints

Conclusion: HTTP is not an option for frontend ↔ API Gateway.

---

## 3. API Gateway and HTTPS

API Gateway:
- Always terminates TLS
- Always provides HTTPS endpoints
- Requires no manual TLS configuration
- Uses AWS-managed certificates by default

Custom domains also require HTTPS via ACM.

---

## 4. Trusted Accounts vs Transport

Trust between AWS accounts is not implemented via transport protocol.

- HTTPS = transport security
- IAM / JWT = authorization and trust
- AWS accounts = administrative boundaries

They solve different problems and do not replace each other.

---

## 5. Authentication Methods over HTTPS

Common approaches:
- JWT authorizers (most common for browser-based apps)
- Lambda authorizers (custom logic, higher cost)
- IAM SigV4 (service-to-service, not for browsers)

---

## 6. Cookies, CORS, and HTTPS

If cookies are used:
- Secure flag requires HTTPS
- SameSite=None requires HTTPS
- CORS must explicitly allow credentials

---

## 7. Summary

- Frontend ↔ API Gateway communication always uses HTTPS
- HTTP is not supported for public browser access
- Account trust is handled by IAM/JWT, not by protocol
- HTTPS is enabled by default and free to use

