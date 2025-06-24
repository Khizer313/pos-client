import { useState } from "react";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import PartyPage from "../PartyPage";
import AddItemModal from "../../components/AddItemModel";

type Payment = {
  paymentId: string;
  customer: string;
  date: string;
  amount: string;
  method: string;
  status: string;
};

const PaymentIn = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const handleAddPayment = (data: Partial<Payment>) => {
    if (editingIndex !== null) {
      // Edit existing payment
      const updated = [...payments];
      updated[editingIndex] = {
        ...updated[editingIndex],
        ...data,
      };
      setPayments(updated);
      setEditingIndex(null);
    } else {
      // Add new payment
      const newPayment: Payment = {
        paymentId: data.paymentId || `#PAY${(payments.length + 1).toString().padStart(3, "0")}`,
        customer: data.customer || "Unknown",
        date: data.date || new Date().toISOString().split("T")[0],
        amount: data.amount || "$0",
        method: data.method || "Unknown",
        status: data.status || "Pending",
      };
      setPayments([...payments, newPayment]);
    }
  };

  const handleDeletePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handleEditPayment = (index: number) => {
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const filteredPayments = payments
    .filter((p) => {
      if (activeFilter === "Received") return p.status === "Received";
      if (activeFilter === "Pending") return p.status === "Pending";
      return true;
    })
    .filter(
      (p) =>
        p.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.method.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const paymentRows = filteredPayments.map((p, index) => ({
    id: index,
    paymentId: p.paymentId,
    customer: p.customer,
    date: p.date,
    amount: p.amount,
    method: p.method,
    status: p.status,
  }));

  const paymentColumns: GridColDef[] = [
    { field: "paymentId", headerName: "Payment ID", flex: 1 },
    { field: "customer", headerName: "Customer", flex: 1 },
    { field: "date", headerName: "Date", flex: 1 },
    { field: "amount", headerName: "Amount", flex: 1 },
    { field: "method", headerName: "Method", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "action",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <div className="space-x-2">
          <button
            className="text-blue-600 hover:underline"
            onClick={() => handleEditPayment(params.id as number)}
          >
            Edit
          </button>
          <button
            className="text-red-600 hover:underline"
            onClick={() => handleDeletePayment(params.id as number)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingIndex(null);
        }}
        onSubmit={handleAddPayment}
        title={editingIndex !== null ? "Edit Payment" : "Add New Payment"}
        defaultValues={
          editingIndex !== null
            ? {
                paymentId: payments[editingIndex]?.paymentId || "",
                customer: payments[editingIndex]?.customer || "",
                date: payments[editingIndex]?.date || "",
                amount: payments[editingIndex]?.amount || "",
                method: payments[editingIndex]?.method || "",
                status: payments[editingIndex]?.status || "",
              }
            : {}
        }
        fields={[
          { name: "paymentId", label: "Payment ID", type: "text" },
          { name: "customer name", label: "Customer Name", type: "text" },
          { name: "date", label: "", type: "date" },
          { name: "amount", label: "Amount", type: "text" },
          {
            name: "payment method",
            label: "Payment Method",
            options: [
              "Cash", "Bank"],
            },          {
              name: "status",
              label: "Status",
              options: ["Received", "Pending"],
            },
            { name: "note", label: "Note", type: "textarea" },
        ]}
      />

      <PartyPage
        title="Payment In"
        breadcrumbs={["Dashboard", "Sales", "Payment In"]}
        buttons={[
          { label: "+ New Payment", variant: "primary", onClick: () => setIsModalOpen(true) },
          { label: "Import Payments", variant: "secondary" },
        ]}
        filters={["All", "Received", "Pending"]}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        customTable={
          <div style={{ width: "100%" }}>
            <DataGrid
              rows={paymentRows}
              columns={paymentColumns}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[10, 20, 50]}
              checkboxSelection
              disableRowSelectionOnClick
              autoHeight
            />
          </div>
        }
      />
    </>
  );
};

export default PaymentIn;
