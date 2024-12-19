import React from "react";

interface AudioFilesPageProps {
  recordings: Array<{
    id: number;
    fileUrl: string;
    transcript: string | null;
    status: string;
    modified_by: { username: string } | null;
    reviewed_by: { username: string } | null;
  }>;
}

const AudioFilesPage: React.FC<AudioFilesPageProps> = ({ recordings }) => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">All Audio Files</h2>
      {recordings.length === 0 ? (
        <p>No recordings available.</p>
      ) : (
        <div className="overflow-x-auto">
        <table className="table-auto w-full mt-4 text-sm sm:text-base">
          <thead>
            <tr>
              <th className="px-4 py-2">File URL</th>
              <th className="px-4 py-2">Transcript</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Modified By</th>
              <th className="px-4 py-2">Reviewed By</th>
            </tr>
          </thead>
          <tbody>
            {recordings.map((recording) => (
              <tr key={recording.id} className="border-b">
                <td className="px-4 py-2">
                  <a href={recording.fileUrl} target="_blank" className="text-blue-500 hover:underline">
                    {recording.fileUrl}
                  </a>
                </td>
                <td className="px-4 py-2">{recording.transcript || "No Transcript"}</td>
                <td className="px-4 py-2">{recording.status}</td>
                <td className="px-4 py-2">
                  {recording.modified_by ? recording.modified_by.username : "N/A"}
                </td>
                <td className="px-4 py-2">
                  {recording.reviewed_by ? recording.reviewed_by.username : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
};

export default AudioFilesPage;
