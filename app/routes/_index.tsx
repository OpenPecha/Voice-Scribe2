import { redirect, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { FaBars } from "react-icons/fa";
import { createUserIfNotExists } from "~/lib/user.server";
import RecordingControlContent from "~/local_component/RecordingControl";
import Sidebar from "~/local_component/Sidebar";

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

  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="p-3">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-4 left-4 bg-blue-500 text-white p-3 rounded-full"
      >
        <FaBars />
      </button>
      <div className="mt-16">
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
    </div>
  );
}
