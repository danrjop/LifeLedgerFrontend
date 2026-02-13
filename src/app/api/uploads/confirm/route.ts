import { NextRequest, NextResponse } from "next/server";
import { ExecuteStatementCommand } from "@aws-sdk/client-rds-data";
import rdsClient, { getClusterArn, getSecretArn, getDatabase } from "@/lib/db-client";
import { decodeJwtPayload } from "@/lib/auth-cookies";

function getUserIdFromRequest(request: NextRequest): string | null {
  const idToken = request.cookies.get("ll_id_token")?.value;
  if (!idToken) return null;

  try {
    const payload = decodeJwtPayload(idToken);
    const exp = payload.exp as number;
    if (exp && exp < Math.floor(Date.now() / 1000)) return null;
    return (payload.sub as string) || null;
  } catch {
    return null;
  }
}

// POST /api/uploads/confirm — record a successful upload in the database
export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { s3Key, filename, contentType } = await request.json();

    if (!s3Key || !filename || !contentType) {
      return NextResponse.json(
        { error: "Missing required fields: s3Key, filename, contentType" },
        { status: 400 }
      );
    }

    await rdsClient.send(
      new ExecuteStatementCommand({
        resourceArn: getClusterArn(),
        secretArn: getSecretArn(),
        database: getDatabase(),
        sql: `INSERT INTO documents (user_id, s3_key, doc_id, doc_type)
              VALUES (:userId, :s3Key, :docId, :docType)`,
        parameters: [
          { name: "userId", value: { stringValue: userId } },
          { name: "s3Key", value: { stringValue: s3Key } },
          { name: "docId", value: { stringValue: filename } },
          { name: "docType", value: { stringValue: contentType } },
        ],
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to confirm upload:", error);
    return NextResponse.json(
      { error: "Failed to confirm upload" },
      { status: 500 }
    );
  }
}
