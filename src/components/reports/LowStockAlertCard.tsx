// components/reports/LowStockAlertCard.tsx
import React from "react";

interface LowStockAlertCardProps {
  items: { productName: string; stockQty: number }[];
  threshold?: number;
}

const LowStockAlertCard: React.FC<LowStockAlertCardProps> = ({
  items,
  threshold = 10,
}) => {
  const lowStockItems = items.filter((item) => item.stockQty <= threshold);

  if (lowStockItems.length === 0) return null;

  return (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded-md mb-4">
      <h3 className="font-semibold mb-2">Low Stock Alert</h3>
      <ul className="list-disc pl-5 space-y-1 max-h-40 overflow-auto">
        {lowStockItems.map((item) => (
          <li key={item.productName}>
            {item.productName} — Only {item.stockQty} left in stock!
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LowStockAlertCard;
