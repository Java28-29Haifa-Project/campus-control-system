import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const ses = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'pending-incident-closures';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@eosm.example.com';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@eosm.example.com';

interface NotificationInput {
    incidentId: string;
    incidentNumber: string;
    userEmails: string[];
    ticketIds: string[];
    requestedBy: string;
    description?: string;
}

export const handler = async (event: NotificationInput) => {
    console.log('Notification Lambda invoked:', JSON.stringify(event));

    try {
        const {
            incidentId,
            incidentNumber,
            userEmails,
            ticketIds,
            requestedBy,
            description
        } = event;

        if (!incidentId || !incidentNumber || !userEmails || userEmails.length === 0) {
            throw new Error('Missing required fields: incidentId, incidentNumber, or userEmails');
        }

        const now = new Date();
        const scheduledFor = Math.floor(now.getTime() / 1000) + 86400;
        const scheduledDate = new Date((now.getTime() + 86400000)).toISOString();


        console.log('Sending emails to:', userEmails);

        const emailPromises = userEmails.map(email => sendEmail({
            toEmail: email,
            incidentNumber,
            scheduledDate,
            description
        }));

        const emailResults = await Promise.allSettled(emailPromises);

        emailResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                console.log(`Email sent successfully to ${userEmails[index]}`);
            } else {
                console.error(`Failed to send email to ${userEmails[index]}:`, result.reason);
            }
        });

        const successfulEmails = emailResults.filter(r => r.status === 'fulfilled').length;
        if (successfulEmails === 0) {
            console.error('Failed to send emails to any users');
        }

        console.log('Writing to DynamoDB:', {
            incidentId,
            scheduledFor,
            ttl: scheduledFor
        });

        const putCommand = new PutItemCommand({
            TableName: TABLE_NAME,
            Item: {
                incidentId: { S: incidentId },
                scheduledFor: { N: scheduledFor.toString() },
                ttl: { N: scheduledFor.toString() },
                requestedBy: { S: requestedBy },
                requestedAt: { S: now.toISOString() },
                incidentNumber: { S: incidentNumber },
                ticketIds: { L: ticketIds.map(id => ({ S: id })) },
                userEmails: { L: userEmails.map(email => ({ S: email })) },
                description: { S: description || 'No description' }
            }
        });

        await dynamodb.send(putCommand);

        console.log('Successfully scheduled incident for auto-close');

        return {
            statusCode: 200,
            body: {
                message: 'Notification sent and auto-close scheduled',
                incidentId,
                incidentNumber,
                emailsSent: successfulEmails,
                scheduledFor: scheduledDate
            }
        };

    } catch (error: any) {
        console.error('Notification Lambda error:', error);
        return {
            statusCode: 500,
            body: {
                error: error.message || 'Failed to send notification'
            }
        };
    }
};

async function sendEmail(params: {
    toEmail: string;
    incidentNumber: string;
    scheduledDate: string;
    description?: string;
}) {
    const { toEmail, incidentNumber, scheduledDate, description } = params;

    const emailBody = `
Hello,

Your incident ${incidentNumber} has been marked as resolved.

${description ? `Description: ${description}` : ''}

If the issue is not completely fixed, please contact support within 24 hours.
Otherwise, this incident will be automatically closed on ${new Date(scheduledDate).toLocaleString()}.

If you need assistance, please contact: ${SUPPORT_EMAIL}

Best regards,
EOSM Support Team

---
This is an automated message. Please do not reply to this email.
    `.trim();

    const command = new SendEmailCommand({
        Source: FROM_EMAIL,
        Destination: {
            ToAddresses: [toEmail]
        },
        Message: {
            Subject: {
                Data: `Incident ${incidentNumber} Resolved - Auto-Close in 24 Hours`,
                Charset: 'UTF-8'
            },
            Body: {
                Text: {
                    Data: emailBody,
                    Charset: 'UTF-8'
                }
            }
        }
    });

    const result = await ses.send(command);
    console.log('Email sent:', { toEmail, messageId: result.MessageId });
    return result;
}