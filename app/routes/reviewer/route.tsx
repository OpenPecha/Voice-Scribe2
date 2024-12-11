import React from "react";
import { Outlet, redirect, useLoaderData } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { prisma } from "~/db.server";
import Reviewer from "./review";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const session = url.searchParams.get("session");
  if (!session) return redirect("/error");
  
  const recording = await prisma.recording.findFirst({
    where: {
      status: "MODIFIED",
      // fileUrl: { not: null},
      transcript: { not: null},
    },
    select: {
      id: true,
      fileUrl: true,
      transcript: true,
      reviewed_transcript: true,
    },
  });
  
  return { recording };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const recordingId = formData.get("recordingId") as string;
  const reviewed_transcript = formData.get("reviewed_transcript") as string;
  const action = formData.get("action") as string;

  if (!recordingId) {
    throw new Error("Missing recording ID");
  }

  if (action === "accept" || action === "reject") {
    await prisma.recording.update({
      where: { id: recordingId },
      data: {
        reviewed_transcript: reviewed_transcript,
        status: action === "accept" ? "REVIEWED" : "MODIFIED",
        updatedAt: new Date(),
      },
    });
  }

  return redirect("/reviewer");
}

export default function ReviewerRoute() {
  const { recording } = useLoaderData();
  const fetcher = useFetcher();

  console.log("recording", recording);

  return (
    <div>
      <h1>Reviewer</h1>
      {recording === null ? (
        <p>No recording available</p>
      ) : (
        <Reviewer 
          recording={{
            id: recording.id,
            fileUrl: recording.fileUrl || "https://monlam-ai-web-testing.s3.ap-south-1.amazonaws.com/TTS/output/1726640623_6e64939f-5cc7-47cc-b9d7-3f2331e44eba-tts-audio.wav",
            transcript: recording.transcript,
            reviewed_transcript: recording.reviewed_transcript || recording.transcript
          }}
          onAccept={(id, reviewedTranscript) => {
            fetcher.submit(
              {
                recordingId: id,
                reviewed_transcript: reviewedTranscript,
                action: 'accept'
              },
              { method: 'POST' }
            );
          }}
          onReject={(id, reviewedTranscript) => {
            fetcher.submit(
              {
                recordingId: id,
                reviewed_transcript: reviewedTranscript,
                action: 'reject'
              },
              { method: 'POST' }
            );
          }}
        />
      )}
    </div>
  );
}