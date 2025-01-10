interface Recording {
  id: number;
  fileUrl: string;
  transcript: string | null;
  status: string;
  modified_by: { username: string } | null;
  reviewed_by: { username: string } | null;
}

interface AudioFilesProps {
  recordings: Recording[];
}

export default function AudioFiles({ recordings }: AudioFilesProps) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4 text-center">All Audio Files</h2>
      {recordings.length === 0 ? (
        <p>No recordings available.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">File URL</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Transcript</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Modified By</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Reviewed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {recordings.map((recording) => (
                <tr key={recording.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap border-b">
                    <a href={recording.fileUrl} target="_blank" className="text-blue-500 hover:underline">
                      {recording.fileUrl}
                    </a>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap border-b">{recording.transcript || "No Transcript"}</td>
                  <td className="px-4 py-2 whitespace-nowrap border-b">{recording.status}</td>
                  <td className="px-4 py-2 whitespace-nowrap border-b">
                    {recording.modified_by ? recording.modified_by.username : "N/A"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap border-b">
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
}