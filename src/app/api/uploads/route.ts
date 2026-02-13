import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ExecuteStatementCommand } from "@aws-sdk/client-rds-data";
import s3Client, { getBucketName } from "@/lib/s3-client";
import rdsClient, { getClusterArn, getSecretArn, getDatabase } from "@/lib/db-client";
import { decodeJwtPayload } from "@/lib/auth-cookies";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
];

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^\w\-. ]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

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

// GET /api/uploads — load user's previously uploaded images
export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await rdsClient.send(
      new ExecuteStatementCommand({
        resourceArn: getClusterArn(),
        secretArn: getSecretArn(),
        database: getDatabase(),
        sql: "SELECT row_id, s3_key, doc_id, doc_type, created_at FROM documents WHERE user_id = :userId ORDER BY created_at DESC",
        parameters: [{ name: "userId", value: { stringValue: userId } }],
      })
    );

    const bucket = getBucketName();
    const documents = await Promise.all(
      (result.records || []).map(async (row) => {
        const rowId = row[0].stringValue!;
        const s3Key = row[1].stringValue!;
        const docId = row[2].stringValue!;
        const docType = row[3].stringValue!;
        const createdAt = row[4].stringValue!;

        const getCommand = new GetObjectCommand({
          Bucket: bucket,
          Key: s3Key,
        });
        const url = await getSignedUrl(s3Client, getCommand, {
          expiresIn: 3600,
        });

        return { id: rowId, filename: docId, url, s3Key, docType, createdAt };
      })
    );

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Failed to load uploads:", error);
    return NextResponse.json(
      { error: "Failed to load uploads" },
      { status: 500 }
    );
  }
}

// POST /api/uploads — generate pre-signed PUT + GET URLs for a new upload
export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { filename, contentType, fileSize } = await request.json();

    if (!filename || !contentType || !fileSize) {
      return NextResponse.json(
        { error: "Missing required fields: filename, contentType, fileSize" },
        { status: 400 }
      );
    }

    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: "Invalid content type. Only images are allowed." },
        { status: 400 }
      );
    }

    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 10MB limit." },
        { status: 400 }
      );
    }

    const sanitizedName = sanitizeFilename(filename);
    const key = `uploads/${userId}/${Date.now()}-${sanitizedName}`;
    const bucket = getBucketName();

    const putCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const putUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 300,
      unhoistableHeaders: new Set(["content-type"]),
    });

    const getCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const getUrl = await getSignedUrl(s3Client, getCommand, {
      expiresIn: 3600,
    });

    return NextResponse.json({ putUrl, getUrl, key });
  } catch (error) {
    console.error("Upload URL generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
