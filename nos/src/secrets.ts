import {GetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager";
import {log} from "./helpers";
import {LogLevel} from "../../backend/gateway/src/types/monitoring";

const secretsClient = new SecretsManagerClient({ region: "us-east-1" });

export interface ServiceConfig {
  mongodb_uri: string;
  admin_email: string;
  source_email: string;
}

let cachedConfig: ServiceConfig | null = null;

export async function getServiceConfig(): Promise<ServiceConfig> {
  if (process.env.MONGODB_URI && process.env.ADMIN_EMAIL) {
    return {
      mongodb_uri: process.env.MONGODB_URI,
      admin_email: process.env.ADMIN_EMAIL,
      source_email: process.env.NOS_EMAIL_SOURCE || 'default@example.com',
    };
  }

  if (cachedConfig) return cachedConfig;

  try {
    const command = new GetSecretValueCommand({
      SecretId: process.env.CONFIG_SECRET_ARN
    });
    const response = await secretsClient.send(command);
    cachedConfig = JSON.parse(response.SecretString || "{}");
    return cachedConfig!;
  } catch (error) {
    log(LogLevel.ERROR, "Failed to fetch secrets from AWS Secrets Manager", {error: error.message});
    throw error;
  }
}