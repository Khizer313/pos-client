// components/reports/InvoicePreviewModal.tsx
import React from "react";

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceContent: React.ReactNode;
}

const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  isOpen,
  onClose,
  invoiceContent,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-md max-w-3xl w-full p-6 overflow-auto max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="text-gray-500 hover:text-gray-700 float-right"
        >
          &#x2715;
        </button>
        <div className="mt-4">{invoiceContent}</div>
      </div>
    </div>
  );
};

export default InvoicePreviewModal;
