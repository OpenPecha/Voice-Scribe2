import { prisma } from "~/db.server";
import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { getSession } from "~/lib/sessions";

// Function to get the userId from the session
const getUserIdFromSession = async (request: Request) => {
  const cookieHeader = request.headers.get("Cookie") || ""; // Ensure cookieHeader is never null
  const session = await getSession(cookieHeader);
  const userId = session.get("userId"); 
  return userId;
};

export let action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;
    const transcript = formData.get("transcript") as string;

    // Get the userId from session
    const userId = await getUserIdFromSession(request);

    // Ensure userId is found
    if (!userId) {
      return json({ error: "User not authenticated" }, { status: 401 });
    }

    // Ensure both file and transcript are provided
    if (!file || !transcript) {
      return json({ error: "File and transcript are required" }, { status: 400 });
    }

    // Save the file and transcript to the database
    const recording = await prisma.recording.create({
      data: {
        fileUrl: null,  // Replace with actual file saving logic to generate a valid file URL
        transcripts: transcript || null,  // Ensure transcript is a valid string or null
        userId: userId,  // Use the userId from the session
      },
    });

    return json({ message: "Recording saved successfully", recording });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};
