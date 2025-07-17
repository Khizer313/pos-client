import { useState, useEffect, useMemo, useCallback } from "react";
import { DataGrid, type GridColDef, type GridPaginationModel, type GridFilterModel } from "@mui/x-data-grid";
import { useMutation, useQuery, NetworkStatus } from "@apollo/client";

import PartyPage from "../../PartyPage";
import AddItemModal from "../../../components/AddItemModel";

import { CREATE_CUSTOMER, UPDATE_CUSTOMER, DELETE_CUSTOMER } from "../../../graphql/mutations";
import { GET_CUSTOMERS_PAGINATED } from "../../../graphql/queries/customers";
import { Skeleton } from "@mui/material";

import { useDebounce } from "../../../hooks/useDebounce"; // ✅ Custom hook for debouncing
import { throttle } from "../../../hooks/useThrottle"; // ✅ Add this import
// import DateRangeFilter from "../../../components/DateRangeFilter";



type Customer = {
   customerId: number;
  name: string;
  phone: string;
  createdAt: string;
  balance: string;
  status: string;
};
type RefetchVars = {
  page: number;
  limit: number;
  search?: string;
  status?: string;
   startDate?: string; // ✅ Add this
  endDate?: string; 
};



const Customers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 User-typed search term
const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });

  // ✅ Debounced searchTerm (delay firing queries)
  const debouncedSearch = useDebounce(searchTerm, 400);

  // GraphQL Mutations
  const [createCustomerMutation] = useMutation(CREATE_CUSTOMER);
  const [updateCustomerMutation] = useMutation(UPDATE_CUSTOMER);
  const [deleteCustomerMutation] = useMutation(DELETE_CUSTOMER);


const [startDate, setStartDate] = useState<string>("");
const [endDate, setEndDate] = useState<string>("");

  // ✏️ Edit customer
const handleEditCustomer = useCallback((id: number) => {
  const customer = customers.find((c) => c.customerId === id);
  if (customer) {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  }
}, [customers]);


// 🗑️ Delete Customer
const handleDeleteCustomer = useCallback(
  async (customerId: number) => {
    const customerToDelete = customers.find((c) => c.customerId === customerId);
    if (!customerToDelete) return;

    try {
      await deleteCustomerMutation({
        variables: { phone: customerToDelete.phone },
      });

      setCustomers((prev) => prev.filter((c) => c.customerId !== customerId));
    } catch (err) {
      console.error("❌ Error deleting customer:", err);
    }
  },
  [customers, deleteCustomerMutation]
);





  // 📊 MUI Rows
const customerRows = useMemo(() => {
  return customers.map((cust) => ({
    id: cust.customerId, // ✅ short readable ID
    ...cust,
  }));
}, [customers]);


  // 📄 MUI Columns
const customerColumns: GridColDef[] = useMemo(() => [
{ field: "customerId", headerName: "ID", flex: 1 },
  { field: "name", headerName: "Name", flex: 1 },
  { field: "phone", headerName: "Phone", flex: 1 },
  { field: "createdAt", headerName: "Created At", flex: 1, type:"string" },
  { field: "balance", headerName: "Balance", flex: 1 },
  { field: "status", headerName: "Status", flex: 1 },
  {
    field: "action",
    headerName: "Action",
    flex: 1,
    renderCell: (params) => (
      <div className="space-x-2">
        <button
          onClick={() => handleEditCustomer(params.id as number)}
          className="text-blue-600 hover:underline"
        >
          Edit
        </button>
        <button
          onClick={() => handleDeleteCustomer(params.id as number)}
          className="text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>
    ),
  },
], [handleEditCustomer, handleDeleteCustomer]);




  // ➕ Add or 🔄 Edit Customer
 const handleAddCustomer = async (data: Partial<Customer>) => {
  const isEditing = editingCustomer !== null;
  const phone = data.phone || "";

  const input = {
    name: data.name || "Unnamed",
    phone: data.phone || "0300-0000000",
    balance: data.balance || "PKR 0",
    status: data.status || "Active",
  };

  try {
    if (isEditing) {
      const result = await updateCustomerMutation({
        variables: { phone, updateCustomerInput: input },
      });
      const updatedCustomer = result.data?.updateCustomer;
      if (updatedCustomer) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.customerId === editingCustomer.customerId ? updatedCustomer : c
          )
        );
      }
    } else {
      const result = await createCustomerMutation({
        variables: { createCustomerInput: input },
      });
      const createdCustomer = result.data?.createCustomer;
      if (createdCustomer) {
        setCustomers((prev) => [...prev, createdCustomer]);
      }
    }

    await refetch();
    setIsModalOpen(false);
    setEditingCustomer(null);
  } catch (err) {
    console.error("❌ Error saving customer:", err);
  }
};








  
  // ✅ Main customer fetch query - server side pagination kar rahy hain ( ar with smart loading using networkstatus)
  const { data,  refetch, networkStatus } = useQuery(GET_CUSTOMERS_PAGINATED, {
    variables: {
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
      search: debouncedSearch || undefined,
      status: activeFilter !== "All" ? activeFilter : undefined,
        startDate: startDate || undefined,
  endDate: endDate || undefined,
    },
    notifyOnNetworkStatusChange: true, // ✅ Enables `networkStatus` change detection
  });




  // ✅ update customer list when data comes from backend
  useEffect(() => {
    if (data?.customersPaginated?.data) {
      setCustomers(data.customersPaginated.data);
    }
  }, [data]);










  // 🔄 Filter tabs logic (Pending / Received)
  // useEffect(() => {
  //   refetch({
  //     page: paginationModel.page + 1,
  //     limit: paginationModel.pageSize,
  //     search: debouncedSearch || undefined,
  //     status: activeFilter === "Pending Payments"
  //       ? "Pending"
  //       : activeFilter === "Received Payments"
  //       ? "Received"
  //       : undefined,
  //   });
  // }, [debouncedSearch, activeFilter, paginationModel.page, paginationModel.pageSize, refetch]);




// throttle kr rhy hain - mui ky column par jab user filter kry to type krny ky 4s bd filter work kry
const throttledRefetch = useMemo(() => {
  return throttle((vars: RefetchVars) => {
    refetch(vars);
  }, 4000);
}, [refetch]);



  // 🔍 Column-wise filtering
// useEffect(() => {
//   const filters = filterModel.items.reduce((acc, item) => {
//     if (item.value) acc.push(item.value.toString());
//     return acc;
//   }, [] as string[]);

//   const combinedSearch = filters.join(" ");

//   throttledRefetch({
//     page: paginationModel.page + 1,
//     limit: paginationModel.pageSize,
//     search: combinedSearch || undefined,
//   });
// }, [filterModel, paginationModel, throttledRefetch]);
//   // ❌ Error
//   if (error) return <p>Error loading customers: {error.message}</p>;

useEffect(() => {
  const columnFilters = filterModel.items.reduce((acc, item) => {
    if (item.value) acc.push(item.value.toString());
    return acc;
  }, [] as string[]);

  const combinedColumnSearch = columnFilters.join(" ");
  const fullSearch = [debouncedSearch, combinedColumnSearch]
    .filter(Boolean)
    .join(" ");

  throttledRefetch({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: fullSearch || undefined,
    
    status: activeFilter === "Pending Payments"
      ? "Pending"
      : activeFilter === "Received Payments"
      ? "Received"
      : undefined,
          startDate: startDate || undefined,
    endDate: endDate || undefined,
      
  });
}, [debouncedSearch, filterModel, activeFilter, paginationModel, throttledRefetch, startDate, endDate]);




  
  // ⏳ Only show loader if initial load (not on debounce or pagination)
if (networkStatus === NetworkStatus.loading && !data) {
  return (
    <div style={{ padding: 16 }}>
      <Skeleton variant="rectangular" height={40} style={{ marginBottom: 8 }} />
      <Skeleton variant="rectangular" height={40} style={{ marginBottom: 8 }} />
      <Skeleton variant="rectangular" height={40} style={{ marginBottom: 8 }} />
      <Skeleton variant="rectangular" height={40} style={{ marginBottom: 8 }} />
      <Skeleton variant="rectangular" height={40} style={{ marginBottom: 8 }} />
    </div>
  );
}













































  return (
    <>
      {/* 🧾 Modal for Add/Edit */}
   <AddItemModal
  key={editingCustomer?.customerId || "add"}
  isOpen={isModalOpen}
  onClose={() => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  }}
  onSubmit={handleAddCustomer}
  title={editingCustomer ? "Edit Customer" : "Add New Customer"}
  defaultValues={
    editingCustomer
      ? {
          name: editingCustomer.name,
          phone: editingCustomer.phone,
          balance: editingCustomer.balance,
          status: editingCustomer.status,
        }
      : {}
  }
  fields={[
    { name: "name", label: "Customer Name", type: "text" },
    { name: "phone", label: "Phone", type: "tel" },
    { name: "balance", label: "Balance", type: "number" },
    {
      name: "status",
      label: "Status",
      options: ["Received", "Pending"],
    },
  ]}
/>














      {/* 📦 Party Page Reusable Wrapper */}
      <PartyPage
        title="Customers"
        breadcrumbs={["Dashboard", "Parties", "Customers"]}
        buttons={[
          { label: "+ Add New Customer", variant: "primary", onClick: () => setIsModalOpen(true) },
          { label: "Import Customer", variant: "secondary" },
        ]}
        filters={["All", "Pending Payments", "Received Payments"]}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}


        // code for date ranges
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onClearDateRange={() => {
             setStartDate("");
             setEndDate("");
          }}


  
        customTable={
          <div style={{ width: "100%" }}>
          <DataGrid
  rows={customerRows}
  columns={customerColumns}
  getRowId={(row) => row.customerId || `${row.phone}-${row.createdAt}`}
  paginationModel={paginationModel}
  paginationMode="server"
  onPaginationModelChange={(newModel) => {
    setPaginationModel(newModel);
    throttledRefetch({
      page: newModel.page + 1,
      limit: newModel.pageSize,
      search: debouncedSearch || undefined,
      status: activeFilter !== "All" ? activeFilter : undefined,
    });
  }}
  rowCount={data?.customersPaginated?.total || 0}
  pageSizeOptions={[10, 20, 50]}
  filterModel={filterModel}
  onFilterModelChange={(model) => setFilterModel(model)}
  checkboxSelection
  disableRowSelectionOnClick
  autoHeight
  loading={networkStatus !== NetworkStatus.ready}
/>

          </div>
        }
      />
    </>
  );
};

export default Customers;
