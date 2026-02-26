import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });

export const handler = async (event) => {
    console.log('Sending notification:', JSON.stringify(event));

    const { incidentId, incidentNumber, userEmail, userName } = event;

    const emailParams = {
        Source: process.env.FROM_EMAIL || 'noreply@your-domain.com',
        Destination: {
            ToAddresses: [userEmail]
        },
        Message: {
            Subject: {
                Data: `Incident ${incidentNumber} - Resolution Notification`
            },
            Body: {
                Text: {
                    Data: `Hello${userName ? ' ' + userName : ''},

Your incident ${incidentNumber} has been resolved.

If you have concerns or the issue persists, please contact our admin team within 24 hours.

Otherwise, the incident will be automatically closed.

Thank you,
EOSM Support Team`
                }
            }
        }
    };

    try {
        const result = await ses.send(new SendEmailCommand(emailParams));
        console.log('Email sent:', result.MessageId);
        return { statusCode: 200, body: { messageId: result.MessageId } };
    } catch (error) {
        console.error('Email failed:', error);
        return { statusCode: 500, body: { error: error.message } };
    }
};