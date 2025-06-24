// components/reports/ReportLayout.tsx
import type { ReactNode } from "react";

interface ReportLayoutProps {
  children: ReactNode;
}

const ReportLayout: React.FC<ReportLayoutProps> = ({ children }) => {
  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Reports Dashboard</h1>
        <p className="text-gray-600 mt-1">View and analyze your business reports</p>
      </header>
      <section className="bg-white rounded shadow p-6">{children}</section>
    </main>
  );
};

export default ReportLayout;
