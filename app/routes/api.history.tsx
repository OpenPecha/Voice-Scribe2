import { LoaderFunction } from "@remix-run/node";
import { prisma } from "~/db.server";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const userEmail = url.searchParams.get("session");

  if (!userEmail) {
    return new Response(
      JSON.stringify({ error: "User session is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const recordings = await prisma.recording.findMany({
    where: {
      OR: [
        { modified_by: { email: userEmail } },
        { reviewed_by: { email: userEmail } },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      transcript: true,
      reviewed_transcript: true,
    },
  });

  if (!recordings || recordings.length === 0) {
    return new Response(
      JSON.stringify({ error: "No submissions available" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const result = {
    user: {
      id: userEmail,
      submissions: recordings.map((recording) => ({
        id: recording.id,
        transcript: recording.reviewed_transcript
          ? recording.reviewed_transcript.slice(0, 50)
          : recording.transcript
          ? recording.transcript.slice(0, 50)
          : "No transcript available",
        createdAt: recording.createdAt.toISOString(),
    })),  
    },
  };

  console.log("API Response", JSON.stringify(result, null, 2));
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
