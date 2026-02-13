import { RDSDataClient } from "@aws-sdk/client-rds-data";

const rdsClient = new RDSDataClient({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
  },
});

export default rdsClient;

export function getClusterArn(): string {
  return process.env.AWS_RDS_CLUSTER_ARN!;
}

export function getSecretArn(): string {
  return process.env.AWS_RDS_SECRET_ARN!;
}

export function getDatabase(): string {
  return process.env.AWS_RDS_DATABASE!;
}
