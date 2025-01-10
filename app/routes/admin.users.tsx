import { LoaderFunction, json, ActionFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { Role } from "@prisma/client";
import Users from "./admin/components/users";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface LoaderData {
  users: User[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const session = url.searchParams.get("session");

  if (!session) throw new Error("Session required");

  const users = await prisma.user.findMany();
  return json<LoaderData>({ users });
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = Object.fromEntries(await request.formData());
    const { userId, role } = formData;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId.toString() },
    });

    if (!existingUser) {
      return json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId.toString() },
      data: { role: role as Role },
    });

    return json({
      success: true,
      message: `Role updated successfully to ${role}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Role update error:", error);
    return json(
      {
        error: "Failed to update user role",
      },
      { status: 500 }
    );
  }
};

export default function UsersRoute() {
  const { users } = useLoaderData<LoaderData>();
  return <Users users={users} />;
}