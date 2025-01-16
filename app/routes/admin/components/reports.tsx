import { useState } from "react";
import { useFetcher } from "@remix-run/react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

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

interface LoaderData {
  userStats: UserStats[];
}

function DateTimePicker({
  label,
  selectedDateTime,
  onSelect,
}: {
  label: string;
  selectedDateTime: Date | null;
  onSelect: (date: Date | null, hours: string, minutes: string) => void;
}) {
  const [hours, setHours] = useState(
    selectedDateTime ? format(selectedDateTime, "HH") : ""
  );
  const [minutes, setMinutes] = useState(
    selectedDateTime ? format(selectedDateTime, "mm") : ""
  );
  const getDefaultTime = (type: "from" | "to") => {
    return type === "from"
      ? { hours: "00", minutes: "00" }
      : { hours: "23", minutes: "59" };
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full sm:w-[280px] justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDateTime
            ? format(selectedDateTime, "MM/dd/yyyy, HH:mm")
            : `Select ${label}`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto bg-white p-0 sm:w-auto" align="start">
        <div className="space-y-4 p-2">
          <div className="w-full min-w-[280px] sm:w-auto">
          <Calendar
            mode="single"
            selected={selectedDateTime}
            onSelect={(date) => {
              if (date) {
                const defaultTime = getDefaultTime(
                  label.toLowerCase() as "from" | "to"
                );
                const initialHours = hours || defaultTime.hours;
                const initialMinutes = minutes || defaultTime.minutes;
                setHours(initialHours);
                setMinutes(initialMinutes);
                onSelect(date, initialHours, initialMinutes);
              }
            }}
            initialFocus
            className="rounded-md border"
          />
          </div>
          <div className="flex gap-2 items-center px-2 sm:px-4 pb-4">
            <div className="flex-1">
              <Input
                type="number"
                min="0"
                max="23"
                placeholder="HH"
                value={hours}
                onChange={(e) => {
                  const newHours = e.target.value;
                  setHours(newHours);
                  if (selectedDateTime && newHours) {
                    onSelect(selectedDateTime, newHours, minutes || "00");
                  }
                }}
                className="w-full"
              />
            </div>
            <span className="text-xl font-semibold">:</span>
            <div className="flex-1">
              <Input
                type="number"
                min="0"
                max="59"
                placeholder="MM"
                value={minutes}
                onChange={(e) => {
                  const newMinutes = e.target.value;
                  setMinutes(newMinutes);
                  if (selectedDateTime && newMinutes) {
                    onSelect(selectedDateTime, hours || "00", newMinutes);
                  }
                }}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function Reports({ userStats }: ReportsProps) {
  const [fromDateTime, setFromDateTime] = useState<Date | null>(null);
  const [toDateTime, setToDateTime] = useState<Date | null>(null);
  const fetcher = useFetcher<LoaderData>();

  const handleDateTimeSelect = (type: "from" | "to", date: Date | null, hours: string, minutes: string) => {
    if (!date) return;
    
    const newDateTime = new Date(date);
    newDateTime.setHours(parseInt(hours), parseInt(minutes));
    
    if (type === "from") {
      setFromDateTime(newDateTime);
    } else {
      setToDateTime(newDateTime);
    }
    
    const updatedFromDate = type === "from" ? newDateTime : fromDateTime;
    const updatedToDate = type === "to" ? newDateTime : toDateTime;
    
    if (updatedFromDate && updatedToDate) {
      const formData = new FormData();
      formData.append("from", updatedFromDate.toISOString());
      formData.append("to", updatedToDate.toISOString());

      const searchParams = new URLSearchParams(window.location.search);
      const session = searchParams.get("session");

      console.log("Submitting with dates:", {
        from: updatedFromDate.toISOString(),
        to: updatedToDate.toISOString()
      });
      fetcher.submit(formData, {
        method: "post",
        action: `/admin/reports?session=${session}`
      });
    }
  };

  const currentStats = fetcher.data?.userStats || userStats;

  const totals = currentStats.reduce(
    (acc, stat) => ({
      tasksSubmitted: acc.tasksSubmitted + stat.tasksSubmitted,
      tasksReviewed: acc.tasksReviewed + stat.tasksReviewed,
      tasksTrashed: acc.tasksTrashed + stat.tasksTrashed,
    }),
    { tasksSubmitted: 0, tasksReviewed: 0, tasksTrashed: 0 }
  );

  const showTable = fromDateTime && toDateTime && currentStats.length > 0;
  
  return (
    <div className="reports-container p-2 sm:p-5">
      <div className="mb-3 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-3 sm:mb-4">User Statistics Report</h1>
        
        <div className="w-full flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-6">
          <div className="w-[260px] sm:w-auto">
          <DateTimePicker
            label="From"
            selectedDateTime={fromDateTime}
            onSelect={(date, hours, minutes) => handleDateTimeSelect('from', date, hours, minutes)}
          />
          </div>

          <div className="w-[260px] sm:w-auto">
            <DateTimePicker
            label="To"
            selectedDateTime={toDateTime}
            onSelect={(date, hours, minutes) => handleDateTimeSelect('to', date, hours, minutes)}
          />
        </div>
      </div>
    </div>

      {fetcher.state === 'loading' && (
        <div className="text-center text-gray-500 mt-2 sm:mt-8">
          Loading statistics...
        </div>
      )}

      {!showTable && fetcher.state !== 'loading' && (
        <div className="text-center text-gray-500 mt-2 sm:mt-8">
          Please select both start and end dates to view the statistics
        </div>
      )}

      {showTable && (
      <div className="rounded-lg border bg-white shadow overflow-x-auto mt-2 sm:mt-4">
        <Table>
          <TableCaption>
            {fromDateTime && toDateTime ? (
              `Statistics for ${format(fromDateTime, "MM/dd/yyyy, HH:mm")} to ${format(toDateTime, "MM/dd/yyyy, HH:mm")}`
            ) : (
              "Select date and time range to view statistics"
            )}
          </TableCaption>
          
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
            {currentStats.map((stat) => (
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
      )}
    </div>
  );
}