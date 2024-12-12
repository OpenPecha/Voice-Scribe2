import { useFetcher } from "@remix-run/react";
import { Role } from "@prisma/client";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface UsersPageProps {
  users: User[];
}

export default function UsersPage({ users }: UsersPageProps) {
  const fetcher = useFetcher();

  const isUpdating = fetcher.state !== "idle";
  const actionData = fetcher.data;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Users Management</h1>

      {/* Status Messages */}
      {actionData?.error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {actionData.error}
        </div>
      )}
      {actionData?.success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          {actionData.message}
        </div>
      )}

      <table className="min-w-full bg-white shadow-sm rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Username
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
              <td className="px-6 py-4 whitespace-nowrap">
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
  );
}
