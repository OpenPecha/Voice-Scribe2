import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { FaPlay } from "react-icons/fa";
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
    role: string;
    submissions: {
      id: string;
      transcript: string;
      createdAt: string;
      fileUrl: string;
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
  const [submissions, setSubmissions] = useState<
    LoaderData["user"]["submissions"]
  >([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedOnce = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (sidebarOpen && user?.email && user?.role) {
      setLoading(true);
      fetcher.load(`/api/history?session=${user.email}&role=${user.role}`);
    }
  }, [sidebarOpen, user?.email, user?.role]);

  useEffect(() => {
    if (fetcher.data?.user?.submissions && fetcher.state === "idle") {
      setSubmissions(fetcher.data.user.submissions);
      setLoading(false);
    }
  }, [fetcher.data, fetcher.state]);

  const handlePlay = (fileUrl: string) => {
    console.log("File URL: ", fileUrl);
    if (audioRef.current) {
      audioRef.current.src = fileUrl;
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
  };

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent
        side="left"
        className="w-72 bg-white text-black"
        aria-describedby="history-description"
      >
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold text-blue-800">
            History
          </SheetTitle>
        </SheetHeader>
        <audio ref={audioRef} controls style={{ display: "none" }} />
        <div id="history-description">
          <ul className="mt-4 space-y-2">
            {loading ? (
              <li className="text-sm text-black">Loading...</li>
            ) : submissions.length > 0 ? (
              submissions.map((submission) => (
                <li
                  key={submission.id}
                  className="flex items-center text-sm border-b py-2"
                >
                  <div className="flex  flex-col w-4/5">
                    <span className="block font-medium truncate">
                      {truncateText(submission.transcript)}
                    </span>
                    <span className="block text-xs text-gray-500">
                      {new Date(submission.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handlePlay(submission.fileUrl)}
                    className="p-2 bg-blue-500 text-white rounded-full text-sm "
                  >
                    <FaPlay />
                  </button>
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
