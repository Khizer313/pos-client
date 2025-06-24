import { useState } from "react";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import PartyPage from "../../PartyPage";
import AddItemModal from "../../../components/AddItemModel";

type Customer = {
  name: string;
  phone: string;
  createdAt: string;
  balance: string;
  status: string;
};

const Customers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");   // 1. Search term state
  const [editingIndex, setEditingIndex] = useState<number | null>(null); // track which customer is editing

  // using it for mui pagination 
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  // Active filter state lifted up for PartyPage filters ("All", "To Collect", "To Pay")
  const [activeFilter, setActiveFilter] = useState("All");

  // Adding new customer or editing existing customer
  const handleAddCustomer = (data: Partial<Customer>) => {
    if (editingIndex !== null) {
      // Editing existing customer
      const updatedCustomers = [...customers];
      updatedCustomers[editingIndex] = {
        ...updatedCustomers[editingIndex],
        ...data,
      };
      setCustomers(updatedCustomers);
      setEditingIndex(null);
    } else {
      // Adding new customer
      const newCustomer: Customer = {
        name: data.name || "Unnamed",
        phone: data.phone || "0300-0000000",
        createdAt: new Date().toISOString().split("T")[0],
        balance: data.balance || "PKR 0",
        status: data.status || "Active",
      };
      setCustomers([...customers, newCustomer]);
    }
  };

  // Delete customer on Delete button click
  const handleDeleteCustomer = (index: number) => {
    const filtered = customers.filter((_, i) => i !== index);
    setCustomers(filtered);
  };

  // Open modal for editing with prefilled data
  const handleEditCustomer = (index: number) => {
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  // Filter customers based on activeFilter and searchTerm
  const filteredCustomers = customers
    .filter((cust) => {
      if (activeFilter === "Pending Payments") return cust.status === "Pending";
      if (activeFilter === "Received Payments") return cust.status === "Received";
      return true; // All or unknown filter show all
    })
    .filter((cust) =>
      cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Mui ka hy yeh, customer column create karny kylia, ar esko party page mi pass kar rhy hain
  const customerColumns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "createdAt", headerName: "Created At", flex: 1 },
    { field: "balance", headerName: "Balance", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <div className="space-x-2">
          <button 
            className="text-blue-600 hover:underline"
            onClick={() => handleEditCustomer(params.id as number)}
          >
            Edit
          </button>
          <button 
            className="text-red-600 hover:underline"
            onClick={() => handleDeleteCustomer(params.id as number)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  // Mui ka hy yeh, customer rows create karny kylia, ar esko partypage mi pass kar rhy hain
  const customerRows = filteredCustomers.map((cust, index) => ({
    id: index,
    name: cust.name,
    phone: cust.phone,
    createdAt: cust.createdAt,
    balance: cust.balance,
    status: cust.status,
  }));

  return (
    <>




      {/* popup component hy, edr bi reuse kr rkha hy esko, ar mulitple inputs create kr rha hy jitni customers.tsx ko need hain */}
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingIndex(null);
        }}
        onSubmit={handleAddCustomer}
        title={editingIndex !== null ? "Edit Customer" : "Add New Customer"}
        defaultValues={
          editingIndex !== null
            ? {
                name: customers[editingIndex]?.name || "",
                phone: customers[editingIndex]?.phone || "",
                balance: customers[editingIndex]?.balance || "",
                status: customers[editingIndex]?.status || "",
              }
            : {}
        }

        // these are popup input fields 
        fields={[
          { name: "name", label: "Customer Name", type: "text" },
          { name: "phone", label: "Phone", type: "tel" },
          {
            name: "status",
            label: "Status",
            options: ["Received", "Pending"], // yeh input field with dropdown hy
          },
        ]}
      />









      {/* partypage reuseability kylia sary project ky pages mi use kia hy miny, edr mui ki table as a prop bhj rha hy ar bhe bhot kuch as a prop hi jara hy sara nichy  */}
      <PartyPage
        title="Customers"

        breadcrumbs={["Dashboard", "Parties", "Customers"]}

        buttons={[
          { label: "+ Add New Customer", variant: "primary", onClick: () => setIsModalOpen(true) },
          { label: "Import Customer", variant: "secondary" },
        ]}

        filters={["All", "Pending Payments", "Received Payments"]}

        searchTerm={searchTerm}                   // 2. Pass search term to PartyPage
        onSearchChange={setSearchTerm}            // 3. Pass handler to update search term
        activeFilter={activeFilter}                // 4. Pass active filter state
        onFilterChange={setActiveFilter}           // 5. Pass handler to update filter


        customTable={
          <div style={{ width: "100%" }}>
            <DataGrid
              rows={customerRows}
              columns={customerColumns}
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

export default Customers;
