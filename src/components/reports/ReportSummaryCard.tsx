// components/ReportSummaryCard.tsx
import React from 'react';

type CardProps = {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
};

const ReportSummaryCard = ({ title, value, icon, color = 'bg-blue-100' }: CardProps) => {
  return (
    <div className={`p-4 rounded-xl shadow-sm ${color} flex items-center gap-3`}>
      {icon && <div className="text-3xl">{icon}</div>}
      <div>
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className="text-lg font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default React.memo(ReportSummaryCard);
