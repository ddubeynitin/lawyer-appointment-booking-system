import React from "react";
import { FaFileAlt } from "react-icons/fa";

export default function Reports() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-100 rounded-lg text-purple-600"><FaFileAlt /></div>
        <h2 className="text-xl font-semibold text-gray-800">System Analytics & Reports</h2>
      </div>
      <div className="space-y-4">
        <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50">Generate Monthly Revenue Report</button>
        <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50">Download Lawyer Performance Data</button>
      </div>
    </div>
  );
}