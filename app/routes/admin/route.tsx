import { LoaderFunction, redirect } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { prisma } from "~/db.server";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const session = url.searchParams.get("session");

  if (!session) return redirect("/error");

  const user = await prisma.user.findUnique({
    where: { email: session },
    select: { id: true, role: true, username: true, email: true },
  });

  if (!user || user.role !== "ADMIN") {
    return redirect("/?session=" + session);
  }

  return { user };
};

export default function AdminRoute() {
  const { user } = useLoaderData<{ user: { email: string; username: string; role: string } }>();
  const location = useLocation();

  return (
    <div className="min-h-screen w-full">
      <div className="flex flex-col items-center">
        <div className="mt-4 px-8 py-2 rounded-md bg-blue-100 shadow-md inline-block"> 
          <h1 className="text-lg font-semibold">Admin</h1>
        </div>

        {/* Navigation */}
        <div className="w-full flex justify-center mt-4">
          <NavigationMenu>
            <NavigationMenuList className="flex space-x-4 bg-white rounded-lg p-2 shadow-md">
              <NavigationMenuItem>
                <Link
                  to={`/admin/users?session=${user.email}`}
                  className={`${navigationMenuTriggerStyle()} ${
                    location.pathname === "/admin/users" ? "bg-accent" : ""
                  }`}
                >
                  Users
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  to={`/admin/audiofiles?session=${user.email}`}
                  className={`${navigationMenuTriggerStyle()} ${
                    location.pathname === "/admin/audiofiles" ? "bg-accent" : ""
                  }`}
                >
                  Audio Files
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  to={`/admin/reports?session=${user.email}`}
                  className={`${navigationMenuTriggerStyle()} ${
                    location.pathname === "/admin/reports" ? "bg-accent" : ""
                  }`}
                >
                  Reports
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Content Area */}
        <div className="w-full max-w-7xl mx-auto px-4 mt-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}