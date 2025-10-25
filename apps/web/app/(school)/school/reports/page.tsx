'use client';

import { Button } from '@repo/ui/button';

export default function ReportsPage() {
  return (
    <section className="animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Reports</h3>
          <div className="flex items-center gap-2">
            {['This Month', 'Last 3 Months', 'This Year'].map((r) => (
              <button
                key={r}
                className="rounded-full px-3 py-1 border hover:bg-indigo-50 text-sm"
              >
                {r}
              </button>
            ))}
            <Button>Export All Reports</Button>
          </div>
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">Report</th>
              <th className="px-4 py-2 text-left">Generated</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {['Fees Summary', 'Attendance Overview', 'Students by Class'].map((name, i) => (
              <tr
                key={name}
                className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all"
              >
                <td className="px-4 py-2 text-gray-900 inline-flex items-center gap-2">
                  <span className="w-4 h-4 rounded-sm bg-gray-300" /> {name}
                </td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  {new Date(Date.now() - i * 86400000).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  <button className="text-indigo-600 hover:underline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
