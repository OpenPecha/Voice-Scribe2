import {useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    fileUrls: {
      id: string;
      fileUrl: string;
      createdAt: string
    }[];
};
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
    const { user } = useLoaderData<LoaderData>();
    const fetcher = useFetcher();
    const [fileUrls, setFileUrls] = useState<LoaderData["user"]["fileUrls"]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sidebarOpen && fileUrls.length === 0) {
          setLoading(true); 
          fetcher.submit(
            { session: user.email },
            { method: "get", action: "/api/history" }
        );
        }
      }, [sidebarOpen, user.email, fetcher, fileUrls.length]);
    
      useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data) {
            console.log("Fetcher data: ", fetcher.data);
            const { fileUrls } = fetcher.data.user;
            setFileUrls(fileUrls || []);
            setLoading(false);
        }
      }, [fetcher.state, fetcher.data]);

      return (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-72" aria-describedby="history-description">
            <SheetHeader>
              <SheetTitle className="text-lg font-semibold text-blue-800">
                History
              </SheetTitle>
            </SheetHeader>
            <div id="history-description">
            <ul className="mt-4 space-y-2">
            {loading ? (
              <li className="text-sm text-blue-800">Loading...</li>
            ) : fileUrls.length > 0 ? (
              fileUrls.map((file) => (
                <li key={file.id} className="text-sm text-blue-800 hover:underline">
                  <Link to={file.fileUrl}>
                    {`Recording - ${new Date(file.createdAt).toLocaleString()}`}
                  </Link>
                </li>
                ))
            ) : (
              <li className="text-sm text-blue-800">No submissions available</li>
            )}
          </ul>
          </div>
          </SheetContent>
        </Sheet>
      );
    }