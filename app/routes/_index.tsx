import { redirect, json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import RecordingControl from "~/local_component/RecordingControl";
import { prisma } from "~/db.server";
import { createUserIfNotExists } from "~/lib/user.server";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const session = url.searchParams.get("session") as string;

  if (!session) {
    return json({ error: "Session not found" }); 
  }

  const user = await createUserIfNotExists(session);

  if (!user) {
    return json({ error: "User not found" });  
  }

  if (user.role === "REVIEWER") {
    return redirect(`/reviewer?session=${user.username}`);
  }
  if (user.role === "ADMIN") {
    return redirect(`/admin?session=${user.username}`);
  }

  let recordings = [];
  if (user.role === "ANNOTATOR") {
    recordings = await prisma.recording.findMany({
      where: { modified_by_id: user.id },
      include: { modified_by: true, reviewed_by: true },
    });
  }

  return json({ user, recordings }); 
};

export default function Index() {
  const { user, recordings, error } = useLoaderData();

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>Loading user data...</div>; 
  }

  return (
    <div className="p-3">
      {user ? (
        <>
          <h1>Welcome, {user.username}!</h1>

          {user.role === "USER" && (
            <div>
              <h2>Your Recordings</h2>
              <RecordingControl recordings={recordings} />
            </div>
          )}

          {user.role === "ANNOTATOR" && (
            <div>
              <h2>Your Recordings</h2>
              {recordings.length > 0 ? (
                <ul>
                  {recordings.map((recording) => (
                    <li key={recording.id}>
                      <p>Recording: {recording.fileUrl}</p>
                      {recording.transcript && (
                        <p>Transcript: {recording.transcript}</p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No recordings found.</p>
              )}
              <RecordingControl recordings={recordings} />
            </div>
          )}

          {user.role === "ADMIN" && (
            <div>
              <h3>Admin Dashboard</h3>
            </div>
          )}

          {user.role === "REVIEWER" && (
            <div>
              <h3>Reviewer Dashboard</h3>
            </div>
          )}
        </>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
}
