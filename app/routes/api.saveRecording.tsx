import { redirect, unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import type { ActionFunction, UploadHandler } from "@remix-run/node";
import { prisma } from "~/db.server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3UploadHandler } from "./utils/s3uploadhandler";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function uploadToS3(data: AsyncIterable<Uint8Array>, filename: string) {
  const chunks = [];
  for await (const chunk of data) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  const key = `recordings/${Date.now()}-${filename}`;
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: "audio/webm",
  });

  await s3Client.send(command);
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export const action: ActionFunction = async ({ request }) => {
  try {
    if (request.method === "POST") {
      const uploadHandler: UploadHandler = unstable_composeUploadHandlers(
        s3UploadHandler,
        unstable_createMemoryUploadHandler(),
      );
      const formData = await unstable_parseMultipartFormData(request, uploadHandler);
      const fileUrl = formData.get("file") as string;
      const transcript = formData.get("transcript") as string;
      const modifiedById = formData.get("modifiedById") as string;

      const user = await prisma.user.findUnique({
        where: { id: modifiedById },
      });

      const newRecording = await prisma.recording.create({
        data: {
          transcript,
          modified_by_id: modifiedById,
          status: "MODIFIED",
         fileUrl: fileUrl, // Save the S3 URL in your database
        },
      });
       return newRecording;
    }
  } catch (error) {
    console.error("Error saving recording:", error);
    throw new Error("Failed to save recording");
  }
};
