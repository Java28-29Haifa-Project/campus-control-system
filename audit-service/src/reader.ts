import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient, QueryCommand} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const tableName = process.env.TABLE_NAME;
    const rawNextKey = event.queryStringParameters?.nextPageKey;
    let exclusiveStartKey = undefined;

    if (rawNextKey) {
      try {
        exclusiveStartKey = JSON.parse(Buffer.from(rawNextKey, 'base64').toString());
      } catch (e) {
        return {
          statusCode: 400,
          body: JSON.stringify({message: 'Invalid nextPageKey'})
        };
      }
    }

    const response = await docClient.send(new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: 'logType = :pk',
      ExpressionAttributeValues: {
        ':pk': 'AUDIT'
      },
      ScanIndexForward: false,
      Limit: 50,
      ExclusiveStartKey: exclusiveStartKey
    }));

    let nextPageKey = null;
    if (response.LastEvaluatedKey) {
      nextPageKey = Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64');
    }

    return {
      statusCode: 200,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        items: response.Items || [],
        count: response.Count,
        nextPageKey: nextPageKey,
      })
    }
  } catch (error) {
    console.error('Reader Error: ', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
      })
    };
  }
}