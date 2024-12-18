import {useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface LoaderData {
  user: {
    id: string;
    email: string;
    submissions: {
      id: string;
      transcript: string;
      createdAt: string
    }[];
};
}

const truncateText = (text: string, charLimit: number = 50): string => {
    if (text.length > charLimit) {
        return text.slice(0, charLimit) + "...";
    }
    return text;
};
export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
    const { user } = useLoaderData<LoaderData>();
    const fetcher = useFetcher();
    const [submissions, setSubmissions] = useState<LoaderData["user"]["submissions"]>([]);
    const [loading, setLoading] = useState(true);
    const hasLoadedOnce = useRef(false);

    useEffect(() => {
        if (sidebarOpen && submissions.length === 0) {
          setLoading(true); 
          fetcher.submit(
            { session: user.email },
            { method: "get", action: "/api/history" }
        );
        hasLoadedOnce.current = true;
        }
      }, [sidebarOpen, user.email, fetcher, submissions.length]);
    
      useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data) {
            console.log("Fetcher data: ", fetcher.data);
            const { submissions } = fetcher.data.user;
            setSubmissions(submissions || []);
            setLoading(false);
        }
      }, [fetcher.state, fetcher.data]);

      return (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-72 bg-white text-black" aria-describedby="history-description">
            <SheetHeader>
              <SheetTitle className="text-lg font-semibold text-blue-800">
                History
              </SheetTitle>
            </SheetHeader>
            <div id="history-description">
            <ul className="mt-4 space-y-2">
            {loading ? (
              <li className="text-sm text-black">Loading...</li>
            ) : submissions.length > 0 ? (
              submissions.map((submission) => (
                <li key={submission.id} className="text-sm ">
                  <span className="block font-medium truncate">{truncateText(submission.transcript)}</span>
                  <span className="block text-xs text-gray-500">
                    {new Date(submission.createdAt).toLocaleString()}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-sm text-black">No submissions available</li>
            )}
          </ul>
          </div>
          </SheetContent>
        </Sheet>
      );
    }