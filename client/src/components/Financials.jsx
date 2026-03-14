import { DollarSign } from "lucide-react";

export default function Financials() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 animate-in slide-in-from-bottom duration-400">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-100 rounded-lg text-green-600"><DollarSign /></div>
        <h2 className="text-xl font-semibold text-gray-800">Financial Reports</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500 uppercase">Total Balance</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">$45,200.00</h3>
        </div>
        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500 uppercase">Pending Payouts</p>
          <h3 className="text-3xl font-bold text-amber-600 mt-1">$1,250.00</h3>
        </div>
      </div>
    </div>
  );
}