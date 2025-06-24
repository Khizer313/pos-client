// components/reports/GraphSection.tsx
import React from "react";

interface GraphSectionProps {
  title: string;
  children: React.ReactNode;
}

const GraphSection: React.FC<GraphSectionProps> = ({ title, children }) => {
  return (
    <section className="my-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="border rounded p-4 bg-white shadow-sm">{children}</div>
    </section>
  );
};

export default GraphSection;
