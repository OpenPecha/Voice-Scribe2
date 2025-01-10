import { useFetcher } from "@remix-run/react";
import { Role } from "@prisma/client";
import { toast } from "react-hot-toast";
import { useEffect } from "react";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface UsersProps {
  users: User[];
}

export default function Users({ users }: UsersProps) {
  const fetcher = useFetcher();
  const isUpdating = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.error) {
        toast.error(fetcher.data.error);
      } else if (fetcher.data.success) {
        toast.success(fetcher.data.message);
      }
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <div className="p-6">
      <div className="overflow-auto rounded-lg border border-gray-200">
        <table className="min-w-full bg-white divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap border-b">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap border-b">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap border-b">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap border-b">
                  <fetcher.Form method="post">
                    <input type="hidden" name="userId" value={user.id} />
                    <div className="flex items-center gap-2">
                      <select
                        name="role"
                        defaultValue={user.role}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        disabled={isUpdating}
                      >
                        <option value="">Select a role</option>
                        {Object.values(Role).map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {isUpdating ? "Updating..." : "Update"}
                      </button>
                    </div>
                  </fetcher.Form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}