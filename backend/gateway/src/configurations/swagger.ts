import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'EOSM API - Enterprise Operations & Service Management',
            version: '1.0.0',
            description: `
# EOSM API Documentation

API for managing service requests, incidents, and user accounts.

## Features
- **Service Requests** - Users submit and track support tickets
- **Incident Management** - Support team creates and manages incidents
- **User Management** - Admin controls user roles and permissions
- **Audit Logging** - Audit trail of actions
- **JWT Authentication** - Secure token-based authentication

## Roles
- **USER** - Can create and view own requests
- **SUPPORT** - Can manage requests and create incidents
- **ENGINEER** - Can work on incidents and update status
- **ADMIN** - Full system access including user management

## Authentication
Most endpoints require JWT bearer token. Get token from \`/auth/login\` endpoint.
            `,
            contact: {
                name: 'EOSM Team',
                email: 'eosm.gateway@atomicmail.io'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'https://gateway.eosm-project.net',
                description: 'Production server'
            },
            {
                url: 'http://localhost:8080',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token obtained from /auth/login'
                }
            },
            schemas: {
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'admin@example.com'
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            example: 'SecurePass123!'
                        }
                    }
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        accessToken: {
                            type: 'string',
                            description: 'JWT access token (expires in 15 minutes)'
                        },
                        refreshToken: {
                            type: 'string',
                            description: 'JWT refresh token (expires in 7 days)'
                        },
                        user: {
                            $ref: '#/components/schemas/User'
                        }
                    }
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'newuser@example.com'
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            minLength: 8,
                            example: 'SecurePass123!'
                        }
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        userId: {
                            type: 'string',
                            example: 'user_001'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'user@example.com'
                        },
                        role: {
                            type: 'string',
                            enum: ['USER', 'SUPPORT', 'ENGINEER', 'ADMIN'],
                            example: 'USER'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },

                CreateRequestBody: {
                    type: 'object',
                    required: ['category', 'priority', 'description'],
                    properties: {
                        category: {
                            type: 'string',
                            enum: ['plumbing', 'electrical', 'hvac', 'gas', 'fire_safety', 'elevators', 'access', 'network', 'infrastructure', 'other'],
                            example: 'network'
                        },
                        priority: {
                            type: 'string',
                            enum: ['low', 'medium', 'high', 'urgent'],
                            example: 'high'
                        },
                        description: {
                            type: 'string',
                            minLength: 5,
                            maxLength: 2000,
                            example: 'Internet connection is down in building A'
                        }
                    }
                },
                Request: {
                    type: 'object',
                    properties: {
                        requestId: {
                            type: 'string',
                            example: 'req_001'
                        },
                        category: {
                            type: 'string',
                            example: 'network'
                        },
                        priority: {
                            type: 'string',
                            example: 'high'
                        },
                        status: {
                            type: 'string',
                            enum: ['open', 'in_progress', 'resolved', 'done'],
                            example: 'open'
                        },
                        description: {
                            type: 'string',
                            example: 'Internet connection is down'
                        },
                        createdBy: {
                            type: 'string',
                            example: 'user_001'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },

                CreateIncidentBody: {
                    type: 'object',
                    required: ['ticketIds', 'impact', 'urgency', 'category', 'description'],
                    properties: {
                        ticketIds: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            minItems: 1,
                            example: ['req_001', 'req_002']
                        },
                        impact: {
                            type: 'string',
                            enum: ['low', 'medium', 'high', 'critical'],
                            example: 'high'
                        },
                        urgency: {
                            type: 'string',
                            enum: ['low', 'medium', 'high'],
                            example: 'high'
                        },
                        category: {
                            type: 'string',
                            enum: ['plumbing', 'electrical', 'hvac', 'gas', 'fire_safety', 'elevators', 'access', 'network', 'infrastructure', 'system', 'other'],
                            example: 'network'
                        },
                        description: {
                            type: 'string',
                            minLength: 5,
                            example: 'Multiple network outages across campus'
                        }
                    }
                },
                Incident: {
                    type: 'object',
                    properties: {
                        incidentId: {
                            type: 'string',
                            example: 'inc_001'
                        },
                        incidentNumber: {
                            type: 'string',
                            example: 'INC-1739382400000'
                        },
                        ticketIds: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            example: ['req_001', 'req_002']
                        },
                        priority: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 4,
                            description: 'Calculated from impact + urgency (1=highest, 4=lowest)',
                            example: 1
                        },
                        status: {
                            type: 'string',
                            enum: ['new', 'assigned', 'in_progress', 'resolved', 'pending_close', 'closed'],
                            example: 'new'
                        },
                        category: {
                            type: 'string',
                            example: 'network'
                        },
                        description: {
                            type: 'string',
                            example: 'Multiple network outages'
                        },
                        assignedTo: {
                            type: 'string',
                            nullable: true,
                            example: 'eng_001'
                        },
                        createdBy: {
                            type: 'string',
                            example: 'support_001'
                        },
                        comments: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Comment'
                            }
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                Comment: {
                    type: 'object',
                    properties: {
                        commentId: {
                            type: 'string',
                            example: 'comment_001'
                        },
                        commentText: {
                            type: 'string',
                            example: 'Working on fixing the network issue'
                        },
                        createdBy: {
                            type: 'string',
                            example: 'eng_001'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },

                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            example: 'Resource not found'
                        },
                        statusCode: {
                            type: 'integer',
                            example: 404
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time'
                        },
                        path: {
                            type: 'string',
                            example: '/api/incidents/123'
                        }
                    }
                }
            },
            responses: {
                Unauthorized: {
                    description: 'Unauthorized - Missing or invalid token',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            example: {
                                error: 'Unauthorized',
                                statusCode: 401,
                                timestamp: '2026-02-26T14:30:00.000Z',
                                path: '/api/incidents'
                            }
                        }
                    }
                },
                Forbidden: {
                    description: 'Forbidden - Insufficient permissions',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            example: {
                                error: 'Forbidden - ADMIN role required',
                                statusCode: 403,
                                timestamp: '2026-02-26T14:30:00.000Z',
                                path: '/api/admin/users'
                            }
                        }
                    }
                },
                NotFound: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                BadRequest: {
                    description: 'Invalid request parameters',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                }
            }
        },
        tags: [
            {
                name: 'Authentication',
                description: 'User authentication and registration'
            },
            {
                name: 'Requests',
                description: 'Service request (ticket) management'
            },
            {
                name: 'Incidents',
                description: 'Incident management and tracking'
            },
            {
                name: 'User Management',
                description: 'Admin user and role management'
            },
            {
                name: 'Audit',
                description: 'Audit log queries'
            },
            {
                name: 'Health',
                description: 'Service health checks'
            }
        ]
    },
    apis: [
        './src/routes/*.ts',
        './src/routes/*.js'
    ]
};

export const swaggerSpec = swaggerJsdoc(options);