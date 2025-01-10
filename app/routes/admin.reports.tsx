import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import Reports from "./admin/components/reports";

interface UserStats {
  username: string;
  role: string;
  tasksSubmitted: number;
  tasksReviewed: number;
  tasksTrashed: number;
}

interface LoaderData {
  userStats: UserStats[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const session = url.searchParams.get("session");

  if (!session) throw new Error("Session required");

  const usersWithStats = await prisma.user.findMany({
    where: {
      role: {
        in: ["ANNOTATOR", "REVIEWER"]
      }
    },
    select: {
      id: true,
      username: true,
      role: true,
      modified: {
        select: {
          id: true,
          status: true
        }
      },
      reviewed: {
        select: {
          id: true,
          status: true
        }
      }
    }
  });

  const userStats = usersWithStats.map(user => {
    const submittedTasks = user.modified.filter(
      r => r.status === "MODIFIED" || r.status === "REVIEWED" || r.status === "TRASH"
    ).length;

    const reviewedTasks = user.reviewed.filter(r => r.status === "REVIEWED").length;
    const trashedTasks = user.reviewed.filter(r => r.status === "TRASH").length;

    return {
      username: user.username,
      role: user.role,
      tasksSubmitted: submittedTasks,
      tasksReviewed: reviewedTasks,
      tasksTrashed: trashedTasks
    };
  });

  return json<LoaderData>({ userStats });
};

export default function ReportsRoute() {
  const { userStats } = useLoaderData<LoaderData>();
  return <Reports userStats={userStats} />;
}