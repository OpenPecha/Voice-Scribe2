import React from "react";

interface Recording {
  id: string;
  status: string;
  transcript?: string;
  modified_by?: { username: string };
  reviewed_by?: { username: string };
  createdAt: string;
}

interface ReportsProps {
  recordings: Recording[];
}

const Reports: React.FC<ReportsProps> = ({ recordings }) => {
  return (
    <div className="reports-container p-5">
      <h1 className="text-2xl font-bold text-center mb-4">Reports</h1>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Transcript</th>
            <th className="px-4 py-2 text-left">Modified By</th>
            <th className="px-4 py-2 text-left">Reviewed By</th>
            <th className="px-4 py-2 text-left">Created At</th>
          </tr>
        </thead>
        <tbody>
          {recordings.map((recording) => (
            <tr key={recording.id}>
              <td className="px-4 py-2 border">{recording.id}</td>
              <td className="px-4 py-2 border">{recording.status}</td>
              <td className="px-4 py-2 border">{recording.transcript || "N/A"}</td>
              <td className="px-4 py-2 border">{recording.modified_by?.username || "N/A"}</td>
              <td className="px-4 py-2 border">{recording.reviewed_by?.username || "N/A"}</td>
              <td className="px-4 py-2 border">
                {new Date(recording.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reports;
