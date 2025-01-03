import React, { useState } from "react";
import { Outlet, redirect, useLoaderData } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { prisma } from "~/db.server";
import { Status } from "@prisma/client";
import Reviewer from "./review";
import Sidebar from "~/local_component/Sidebar";
import { FaBars } from "react-icons/fa";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const session = url.searchParams.get("session");
  if (!session) return redirect("/error");
  const user = await prisma.user.findUnique({
    where: { email: session },
    select: { id: true, role: true, username: true, email: true },
  });
  if (!user) return redirect("/error");
  if (user.role !== "REVIEWER") return redirect("/?session=" + session);

  const recording = await prisma.recording.findFirst({
    where: {
      status: "MODIFIED",
      fileUrl: { not: null },
      transcript: { not: null },
    },
    select: {
      id: true,
      fileUrl: true,
      transcript: true,
      reviewed_transcript: true,
    },
  });

  return { recording, user };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const recordingId = formData.get("recordingId") as string;
  const reviewed_transcript = formData.get("reviewed_transcript") as string;
  const reviewer_id = formData.get("reviewed_by") as string;
  const email = formData.get("email") as string;
  const action = formData.get("action") as string;

  if (!recordingId || !email) {
    throw new Error("Missing recording ID or email");
  }

  if (action === "accept" || action === "reject") {
    await prisma.recording.update({
      where: { id: recordingId },
      data: {
        reviewed_transcript: reviewed_transcript,
        reviewed_by_id: reviewer_id,
        status: action === "accept" ? Status.REVIEWED : Status.TRASH,
        updatedAt: new Date(),
      },
    });
  }

  return redirect(`/reviewer?session=${email}`);
};

export default function ReviewerRoute() {
  const { recording, user } = useLoaderData();
  const fetcher = useFetcher();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <button
      onClick={() => setSidebarOpen(!sidebarOpen)}
      className="absolute top-4 left-4 bg-blue-500 text-white p-3 rounded-full z-10"
      >
  <FaBars />
  </button>
    <div>
      <h1 className="text-2xl font-bold pt-6 text-black text-center">Reviewer</h1>
      {recording === null ? (
        <p className="text-red-500 mt-6">No recording available</p>
      ) : (
        <Reviewer
          recording={{
            id: recording.id,
            fileUrl: recording.fileUrl,
            transcript: recording.transcript,
            reviewed_transcript:
              recording.reviewed_transcript || recording.transcript,
          }}
          onAccept={(id, reviewedTranscript) => {
            fetcher.submit(
              {
                recordingId: id,
                reviewed_transcript: reviewedTranscript,
                reviewed_by: user.id,
                email: user.email,
                action: "accept",
              },
              { method: "POST" }
            );
          }}
          onReject={(id, reviewedTranscript) => {
            fetcher.submit(
              {
                recordingId: id,
                reviewed_transcript: reviewedTranscript,
                reviewed_by: user.id,
                email: user.email,
                action: "reject",
              },
              { method: "POST" }
            );
          }}
        />
      )}
    </div>
    </div>
  );
}
