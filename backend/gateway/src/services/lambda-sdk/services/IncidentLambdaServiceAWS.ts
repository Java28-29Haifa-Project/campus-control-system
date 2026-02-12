import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { IIncidentLambdaService } from '../interfaces/IIncidentLambdaService.js';
import Logger from '../../../utils/logger.js';

const lambda = new LambdaClient({ region: process.env.AWS_REGION });

class IncidentLambdaServiceAWS implements IIncidentLambdaService {
    private functionName = process.env.INCIDENT_LAMBDA_NAME || 'incident-service-lambda';

    async addComment(data: {
        incidentId: string;
        commentText: string;
        createdBy: string;
    }): Promise<any> {
        const payload = {
            action: 'ADD_COMMENT',
            data: {
                incidentId: data.incidentId,
                commentText: data.commentText,
                createdBy: data.createdBy
            }
        };

        const command = new InvokeCommand({
            FunctionName: this.functionName,
            Payload: JSON.stringify(payload)
        });

        try {
            Logger.info('Invoking Lambda - ADD_COMMENT', {
                functionName: this.functionName,
                incidentId: data.incidentId
            });

            const response = await this.lambdaClient.send(command);
            const result = JSON.parse(new TextDecoder().decode(response.Payload));

            if (result.statusCode >= 500) {
                Logger.error('Lambda returned server error - ADD_COMMENT', {
                    statusCode: result.statusCode,
                    error: result.body?.error
                });
            } else if (result.statusCode >= 400) {
                Logger.warn('Lambda returned client error - ADD_COMMENT', {
                    statusCode: result.statusCode,
                    error: result.body?.error
                });
            }

            if (result.statusCode !== 201) {
                throw new Error(result.body?.error || 'Failed to add comment');
            }

            return result.body;
        } catch (error: any) {
            Logger.error('Error invoking Lambda - ADD_COMMENT', {
                error: error.message,
                functionName: this.functionName
            });
            throw error;
        }
    }

    async createIncident(input: any): Promise<any> {
        return this.invoke({
            action: 'CREATE_INCIDENT',
            data: {
                ticketIds: input.ticketIds,
                impact: input.impact,
                urgency: input.urgency,
                category: input.category,
                description: input.description,
                createdBy: input.createdBy
            }
        });
    }

    async assignIncident(input: any): Promise<any> {
        return this.invoke({
            action: 'ASSIGN_INCIDENT',
            data: {
                incidentId: input.incidentId,
                assignedBy: input.assignedBy
            }
        });
    }

    async updateIncidentStatus(input: any): Promise<any> {
        return this.invoke({
            action: 'UPDATE_STATUS',
            data: {
                incidentId: input.incidentId,
                status: input.status,
                comment: input.comment,
                updatedBy: input.updatedBy
            }
        });
    }

    async updateIncidentPriority(input: any): Promise<any> {
        return this.invoke({
            action: 'UPDATE_PRIORITY',
            data: {
                incidentId: input.incidentId,
                priority: input.priority,
                comment: input.comment,
                updatedBy: input.updatedBy
            }
        });
    }

    async getIncidents(input: any): Promise<any[]> {
        return this.invoke({
            action: 'GET_INCIDENTS',
            data: {
                filters: input.filters
            }
        });
    }

    async getIncidentById(input: any): Promise<any> {
        return this.invoke({
            action: 'GET_INCIDENT_BY_ID',
            data: {
                incidentId: input.incidentId
            }
        });
    }

    async healthCheck(): Promise<any> {
        return this.invoke({
            action: 'HEALTH_CHECK',
            data: {}
        });
    }

    private async invoke(payload: any): Promise<any> {
        try {
            const command = new InvokeCommand({
                FunctionName: this.functionName,
                Payload: Buffer.from(JSON.stringify(payload))
            });

            const response = await lambda.send(command);

            if (!response.Payload) {
                Logger.error('Incident Lambda returned empty payload', {
                    functionName: this.functionName,
                    action: payload.action
                });
                throw new Error('Lambda returned empty payload');
            }

            const result = JSON.parse(Buffer.from(response.Payload).toString());

            if (result.statusCode && result.statusCode >= 400) {
                const errorBody = typeof result.body === 'string'
                    ? JSON.parse(result.body)
                    : result.body;

                if (result.statusCode >= 500) {
                    Logger.error('Incident Lambda execution failed', {
                        functionName: this.functionName,
                        action: payload.action,
                        statusCode: result.statusCode,
                        error: errorBody.error,
                        errorCode: errorBody.code
                    });
                } else {
                    Logger.warn('Incident Lambda returned client error', {
                        functionName: this.functionName,
                        action: payload.action,
                        statusCode: result.statusCode,
                        error: errorBody.error
                    });
                }

                throw new Error(errorBody?.error || 'Lambda execution failed');
            }

            return typeof result.body === 'string'
                ? JSON.parse(result.body)
                : (result.body || result);

        } catch (error: any) {
            Logger.error('Incident Lambda invocation error', {
                functionName: this.functionName,
                action: payload.action,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }
}

export const incidentLambdaServiceAWS = new IncidentLambdaServiceAWS();