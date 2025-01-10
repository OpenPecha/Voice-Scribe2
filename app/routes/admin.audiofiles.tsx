import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import AudioFiles from "./admin/components/audiofiles";

interface Recording {
  id: number;
  fileUrl: string;
  transcript: string | null;
  status: string;
  modified_by: { username: string } | null;
  reviewed_by: { username: string } | null;
}

interface LoaderData {
  recordings: Recording[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const session = url.searchParams.get("session");

  if (!session) throw new Error("Session required");

  const recordings = await prisma.recording.findMany({
    include: { modified_by: true, reviewed_by: true },
  });
  
  return json<LoaderData>({ recordings });
};

export default function AudioFilesRoute() {
  const { recordings } = useLoaderData<LoaderData>();
  return <AudioFiles recordings={recordings} />;
}