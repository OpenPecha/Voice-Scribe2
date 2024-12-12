import { redirect, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createUserIfNotExists } from "~/lib/user.server";
import RecordingControlContent from "~/local_component/RecordingControl";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const session = url.searchParams.get("session") as string;

  if (!session) {
    return { error: "Session not found" };
  }
  const user = await createUserIfNotExists(session);

  if (!user) {
    return { error: "User not found" };
  }

  if (user.role === "REVIEWER") {
    return redirect(`/reviewer?session=${user.email}`);
  }
  if (user.role === "ADMIN") {
    return redirect(`/admin?session=${user.email}`);
  }

  return { user };
};

export default function Index() {
  const { user, error } = useLoaderData();

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="p-3">
      {user.role === "USER" && (
        <h1 className="text-2xl font-bold text-green-500">
          Welcome, {user.username}!, you are yet to assign a role. Please
          contact the admin
        </h1>
      )}
      {user.role === "ANNOTATOR" && (
        <>
          <h1 className="text-2xl font-bold text-green-500">
            Welcome, {user.username}!
          </h1>

          <div>
            <RecordingControlContent />
          </div>
        </>
      )}
    </div>
  );
}
