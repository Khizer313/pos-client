import { useState } from "react";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import PartyPage from "../../PartyPage";
import AddItemModal from "../../../components/AddItemModel";
import { useMutation } from "@apollo/client";
import { CREATE_CUSTOMER } from "../../../graphql/mutations"; 

import {  useEffect } from "react";
import { useQuery } from "@apollo/client";
// import { GET_CUSTOMERS } from "../../../graphql/queries/customers";
import { UPDATE_CUSTOMER } from "../../../graphql/mutations";
import { DELETE_CUSTOMER } from "../../../graphql/mutations";
import { GET_CUSTOMERS_PAGINATED } from "../../../graphql/queries/customers";
// import type { GridSortModel } from '@mui/x-data-grid';

import { type GridFilterModel } from "@mui/x-data-grid";



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
  // Active filter state lifted up for PartyPage filters ("All", "To Collect", "To Pay")
  const [activeFilter, setActiveFilter] = useState("All");

  // const { data, loading, error } = useQuery(GET_CUSTOMERS);
  
  const [createCustomerMutation] = useMutation(CREATE_CUSTOMER);
const [deleteCustomerMutation] = useMutation(DELETE_CUSTOMER);
const [updateCustomerMutation] = useMutation(UPDATE_CUSTOMER);


  // using it for mui pagination 
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });


const [filterModel, setFilterModel] = useState<GridFilterModel>({
  items: [],
});



// sorting based on columns
// const [sortModel, setSortModel] = useState<GridSortModel>([]);
// const handleSortModelChange = (model: GridSortModel) => {
//   setSortModel(model);
// };



// getting paginating customers - server side pagination
const { data, loading, error, refetch } = useQuery(GET_CUSTOMERS_PAGINATED, {
  variables: {
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: searchTerm || undefined,
    status: activeFilter !== "All" ? activeFilter : undefined,
    //   sortBy: sortModel[0]?.field || null,
    // sortOrder: sortModel[0]?.sort || null
  },
});

// mui column wise filtering
 useEffect(() => {
  const nameFilter = filterModel.items.find((item) => item.field === "name")?.value;
  const statusFilter = filterModel.items.find((item) => item.field === "status")?.value;
  refetch({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: nameFilter || "",
    status: statusFilter || "",
  });
}, [filterModel, paginationModel, refetch]);



  useEffect(() => {
    if (data?.customersPaginated?.data) {
      setCustomers(data.customersPaginated.data);
    }
  }, [data]);


//filtering based on All, Pending, Received buttons
  useEffect(() => {
    refetch({
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
      search: searchTerm || undefined,
      status: activeFilter === "Pending Payments"? "Pending": activeFilter === "Received Payments"? "Received": undefined,
          });
}, [searchTerm, activeFilter, paginationModel.page, paginationModel.pageSize, refetch]);

  if (loading) return <p>Loading customers...</p>;
  if (error) return <p>Error loading customers: {error.message}</p>;






  // Adding new customer or editing existing customer
const handleAddCustomer = async (data: Partial<Customer>) => {
  const isEditing = editingIndex !== null;
  const phone = data.phone || ""; // phone is used for updating
  const input = {
    name: data.name || "Unnamed",
    phone: data.phone || "0300-0000000",
    balance: data.balance || "PKR 0",
    status: data.status || "Active",
  };

  try {
    if (isEditing) {
      // 🔄 Update logic
      const result = await updateCustomerMutation({
        variables: {
          phone: phone,
          updateCustomerInput: input,
        },
      });
      const updatedCustomer = result.data?.updateCustomer;
      if (updatedCustomer) {
        const updatedList = [...customers];
        updatedList[editingIndex!] = updatedCustomer;
        setCustomers(updatedList);
        console.log("✅ Customer updated from backend:", updatedCustomer);
      }
    } else {
      // ➕ Create logic
      const result = await createCustomerMutation({
        variables: {
          createCustomerInput: input,
        },
      });
      const createdCustomer = result.data?.createCustomer;
      if (createdCustomer) {
        setCustomers([...customers, createdCustomer]);
        console.log("✅ Created from backend:", createdCustomer);
      }
    }

    setIsModalOpen(false);
    setEditingIndex(null);
  } catch (err) {
    console.error("Error saving customer:", err);
  }
};

  // Deleting customer 
const handleDeleteCustomer = async (index: number) => {
  const customerToDelete = customers[index];
  if (!customerToDelete) return;

  try {
    await deleteCustomerMutation({
      variables: {
        phone: customerToDelete.phone,
      },
    });

    // Remove from local state
    const filtered = customers.filter((_, i) => i !== index);
    setCustomers(filtered);
    console.log("🗑️ Customer deleted successfully");
  } catch (err) {
    console.error("❌ Error deleting customer:", err);
  }
};




 



  // Open modal for editing with prefilled data
  const handleEditCustomer = (index: number) => {
    setEditingIndex(index);
    setIsModalOpen(true);
  };




  // Filter customers based on activeFilter and searchTerm
  // const filteredCustomers = customers
  //   .filter((cust) => {
  //     if (activeFilter === "Pending Payments") return cust.status === "Pending";
  //     if (activeFilter === "Received Payments") return cust.status === "Received";
  //     return true; // All or unknown filter show all
  //   })
  //   .filter((cust) =>
  //     cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     cust.phone.toLowerCase().includes(searchTerm.toLowerCase())
  //   );




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
const customerRows = customers.map((cust, index) => ({
  id: index, // Use stable unique ID
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
          { name: "balance", label: "Balance", type: "number " },
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
              paginationMode="server" // ✅ enable server-side pagination
              onPaginationModelChange={(newModel) => {
                setPaginationModel(newModel);
                refetch({
                  page: newModel.page + 1,
                  limit: newModel.pageSize,
                  search: searchTerm || undefined,
                  status: activeFilter === "All" ? undefined : activeFilter,
                });
              }}
              rowCount={data?.customersPaginated?.total || 0} // ✅ total from backend
              pageSizeOptions={[10, 20, 50]}
  //                sortingMode="server"
  // sortModel={sortModel}
  // onSortModelChange={handleSortModelChange}
    filterModel={filterModel}
 onFilterModelChange={(model) => setFilterModel(model)}
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
