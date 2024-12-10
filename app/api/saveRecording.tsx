import { json } from "@remix-run/node"; 
import type { ActionFunction } from "@remix-run/node"; 
import { prisma } from "~/db.server";

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const status = formData.get("status") as string; 
    const transcript = formData.get("transcript") as string;
    const helperText = formData.get("helperText") as string;
    const modifiedById = formData.get("modifiedById") as string | null;
    const reviewedById = formData.get("reviewedById") as string | null;

    if (!status || !transcript) {
      return json({ error: "Status and transcript are required." }, { status: 400 });
    }

    const newRecording = await prisma.recording.create({
      data: {
        status,
        transcript,
        helper_text: helperText || null,
        modified_by_id: modifiedById || null,
        reviewed_by_id: reviewedById || null,
      },
    });

    return json({ message: "Recording saved successfully!", recording: newRecording }, { status: 200 });
  } catch (error) {
    console.error("Error saving recording:", error);
    return json({ error: "Failed to save recording. Please try again later." }, { status: 500 });
  }
};
