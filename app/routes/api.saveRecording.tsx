import { redirect, unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import type { ActionFunction, UploadHandler } from "@remix-run/node";
import { prisma } from "~/db.server";
import { s3UploadHandler } from "./utils/s3uploadhandler";





export const action: ActionFunction = async ({ request }) => {
  try {
    if (request.method === "POST") {
      const uploadHandler: UploadHandler = unstable_composeUploadHandlers(
        s3UploadHandler,
        unstable_createMemoryUploadHandler(),
      );
      const formData = await unstable_parseMultipartFormData(request, uploadHandler);
      const fileUrl = formData.get("file") as string;
      console.log(fileUrl)
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
