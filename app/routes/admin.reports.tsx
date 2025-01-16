import { LoaderFunction, ActionFunction, json } from "@remix-run/node";
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

export const action: ActionFunction = async ({ request }) => {
  const url = new URL(request.url);
  const session = url.searchParams.get("session");

  if (!session) throw new Error("Session required");

  const formData = await request.formData();
  const from = formData.get("from");
  const to = formData.get("to");
  
  console.log('Received form data:', { from, to });

  if (!from || !to) {
    return json<LoaderData>({ userStats: [] });
  }

  const startDate = new Date(from as string);
  const endDate = new Date(to as string);

  console.log('Query date range:', {
    from: startDate.toISOString(),
    to: endDate.toISOString()
  });

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
        where: {
          modifiedAt: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          id: true,
          status: true,
          modifiedAt: true
        }
      },
      reviewed: {
        where: {
          updatedAt: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          id: true,
          status: true,
          updatedAt: true
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

  console.log('Final stats:', userStats);
  return json<LoaderData>({ userStats });
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const session = url.searchParams.get("session");

  if (!session) throw new Error("Session required");
  return json<LoaderData>({ userStats: [] });
};

export default function ReportsRoute() {
  const { userStats } = useLoaderData<LoaderData>();
  return <Reports userStats={userStats} />;
}