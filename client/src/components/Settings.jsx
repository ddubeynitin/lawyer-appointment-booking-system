import React from "react";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gray-100 rounded-lg text-gray-600"><Settings /></div>
        <h2 className="text-xl font-semibold text-gray-800">Admin Settings</h2>
      </div>
      <div className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">System Name</label>
          <input type="text" className="w-full p-2 border rounded" defaultValue="EsueBook Admin" />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Update Preferences</button>
      </div>
    </div>
  );
}