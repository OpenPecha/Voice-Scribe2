import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

interface UserStats {
  username: string;
  role: string;
  tasksSubmitted: number;
  tasksReviewed: number;
  tasksTrashed: number;
}

interface ReportsProps {
  userStats: UserStats[];
}

export default function Reports({ userStats }: ReportsProps) {
  const totals = userStats.reduce(
    (acc, stat) => ({
      tasksSubmitted: acc.tasksSubmitted + stat.tasksSubmitted,
      tasksReviewed: acc.tasksReviewed + stat.tasksReviewed,
      tasksTrashed: acc.tasksTrashed + stat.tasksTrashed,
    }),
    { tasksSubmitted: 0, tasksReviewed: 0, tasksTrashed: 0 }
  );

  return (
    <div className="reports-container p-5">
      <h1 className="text-2xl font-bold text-center mb-4">User Statistics Report</h1>

      <div className="rounded-lg border bg-white shadow">
        <Table>
          <TableCaption>List of user stats</TableCaption>
          
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[200px]">Username</TableHead>
              <TableHead className="w-[150px]">Role</TableHead>
              <TableHead className="text-right">Tasks Submitted</TableHead>
              <TableHead className="text-right">Tasks Reviewed</TableHead>
              <TableHead className="text-right">Tasks Trashed</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {userStats.map((stat) => (
              <TableRow key={stat.username} className="hover:bg-gray-50">
                <TableCell className="font-medium">{stat.username}</TableCell>
                <TableCell>{stat.role}</TableCell>
                <TableCell className="text-right">{stat.tasksSubmitted}</TableCell>
                <TableCell className="text-right">{stat.tasksReviewed}</TableCell>
                <TableCell className="text-right">{stat.tasksTrashed}</TableCell>
              </TableRow>
            ))}

            <TableRow className="bg-gray-100 font-semibold">
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="text-right">{totals.tasksSubmitted}</TableCell>
              <TableCell className="text-right">{totals.tasksReviewed}</TableCell>
              <TableCell className="text-right">{totals.tasksTrashed}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}