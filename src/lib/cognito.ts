import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { createHmac } from "crypto";

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_COGNITO_REGION!,
});

export default cognitoClient;

export function computeSecretHash(username: string): string {
  const clientId = process.env.AWS_COGNITO_CLIENT_ID!;
  const clientSecret = process.env.AWS_COGNITO_CLIENT_SECRET!;
  const hmac = createHmac("sha256", clientSecret);
  hmac.update(username + clientId);
  return hmac.digest("base64");
}

export function getClientId(): string {
  return process.env.AWS_COGNITO_CLIENT_ID!;
}
