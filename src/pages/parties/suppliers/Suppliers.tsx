import { useState } from "react";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import PartyPage from "../../PartyPage";
import AddItemModal from "../../../components/AddItemModel";

type Supplier = {
  name: string;
  phone: string;
  createdAt: string;
  balance: string;
  status: string;
};

const Suppliers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  // Add new or update existing supplier
  const handleAddSupplier = (data: Partial<Supplier>) => {
    if (editingIndex !== null) {
      // Update supplier
      const updatedSuppliers = [...suppliers];
      updatedSuppliers[editingIndex] = {
        ...updatedSuppliers[editingIndex],
        ...data,
      };
      setSuppliers(updatedSuppliers);
      setEditingIndex(null);
    } else {
      // Add new supplier
      const newSupplier: Supplier = {
        name: data.name || "Unnamed Supplier",
        phone: data.phone || "0321-0000000",
        createdAt: new Date().toISOString().split("T")[0],
        balance: data.balance || "PKR 0",
        status: data.status || "Due",
      };
      setSuppliers([...suppliers, newSupplier]);
    }
    setIsModalOpen(false);
  };

  // Delete supplier by index
  const handleDeleteSupplier = (index: number) => {
    setSuppliers(suppliers.filter((_, i) => i !== index));
  };

  // Edit supplier - open modal and prefill data
  const handleEditSupplier = (index: number) => {
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  // Filtered and searched suppliers
  const filteredSuppliers = suppliers
    .filter((sup) => {
      if (activeFilter === "Due") return sup.status === "Due";
      if (activeFilter === "Paid") return sup.status === "Paid";
      return true;
    })
    .filter((sup) =>
      sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // DataGrid columns with Edit/Delete actions
  const supplierColumns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "createdAt", headerName: "Created At", flex: 1 },
    { field: "balance", headerName: "Balance", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="space-x-3">
          <button
            className="text-blue-600 hover:underline"
            onClick={() => handleEditSupplier(params.id as number)}
          >
            Edit
          </button>
          <button
            className="text-red-600 hover:underline"
            onClick={() => handleDeleteSupplier(params.id as number)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  // Rows for DataGrid with id required by MUI
  const supplierRows = filteredSuppliers.map((sup, index) => ({
    id: index,
    name: sup.name,
    phone: sup.phone,
    createdAt: sup.createdAt,
    balance: sup.balance,
    status: sup.status,
  }));

  return (
    <>
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingIndex(null);
        }}
        onSubmit={handleAddSupplier}
        title={editingIndex !== null ? "Edit Supplier" : "Add New Supplier"}
        defaultValues={
          editingIndex !== null
            ? {
                name: suppliers[editingIndex]?.name || "",
                phone: suppliers[editingIndex]?.phone || "",
                balance: suppliers[editingIndex]?.balance || "",
                status: suppliers[editingIndex]?.status || "",
              }
            : {}
        }
        fields={[
          { name: "name", label: "Supplier Name", type: "text" },
          { name: "phone", label: "Phone", type: "tel" },
          { name: "balance", label: "Balance", type: "number" },
          {
            name: "status",
            label: "Status",
            options: ["Due", "Paid"], // MUI autocomplete dropdown
          },
        ]}
      />

      <PartyPage
        title="Suppliers"
        breadcrumbs={["Dashboard", "Parties", "Suppliers"]}
        buttons={[
          { label: "+ Add New Supplier", variant: "primary", onClick: () => setIsModalOpen(true) },
          { label: "Import Supplier", variant: "secondary" },
        ]}
        filters={["All", "Due", "Paid"]}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        customTable={
          <div style={{ width: "100%" }}>
            <DataGrid
              rows={supplierRows}
              columns={supplierColumns}
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

export default Suppliers;
