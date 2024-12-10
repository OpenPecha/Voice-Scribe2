import React from "react";
import { Outlet, redirect, useLoaderData } from "@remix-run/react";
import { LoaderFunction } from "@remix-run/node";
import { prisma } from "~/db.server";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const session = url.searchParams.get("session");
  
  if (!session) return redirect("/error");
  
  const user = await prisma.user.findFirst({
    where: { username: session, role: "REVIEWER" },
    include: {
      reviewedUsers: {
        where: { role: "ANNOTATOR" },
      },
    },
  });

  if (!user || user.role !== "REVIEWER") {
    return redirect("/");
  }
  
  return { user, session };
};

function ReviewerRoute() {
  const { user, session } = useLoaderData();

  return (
    <div className="p-3">
      <Outlet />
    </div>
  );
}

export default ReviewerRoute;