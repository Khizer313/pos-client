import { useState, useEffect, useMemo, useCallback, useTransition } from "react";
import { DataGrid, type GridColDef, type GridPaginationModel, type GridFilterModel, type GridRenderCellParams } from "@mui/x-data-grid";
import { useMutation, useQuery, NetworkStatus } from "@apollo/client";


import { CREATE_CUSTOMER, UPDATE_CUSTOMER, DELETE_CUSTOMER } from "../../../graphql/mutations";
import { GET_CUSTOMERS_PAGINATED } from "../../../graphql/queries/customers";
import { Skeleton } from "@mui/material";

import { useDebounce } from "../../../hooks/useDebounce"; // ✅ Custom hook for debouncing
import { throttle } from "../../../hooks/useThrottle"; // ✅ Add this import
// import DateRangeFilter from "../../../components/DateRangeFilter";
import { Toaster, toast } from 'react-hot-toast';

import { lazy, Suspense } from "react";
import FallbackLoader from "../../../components/FallbackLoader";

const AddItemModal = lazy(() => import("../../../components/AddItemModel"));
const PartyPage = lazy(() => import("../../PartyPage"));







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
   startDate?: string;
  endDate?: string; 
};



const Customers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerPages, setCustomerPages] = useState<Map<number, Customer[]>>(new Map());
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

const [isPending, startTransition] = useTransition();

const [pageAccessLog, setPageAccessLog] = useState<number[]>([]);







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
        setCustomerPages((prev) => {
          const newMap = new Map(prev);
          const pageData = newMap.get(paginationModel.page) || [];

          const updatedPage = pageData.map((c) =>
            c.customerId === editingCustomer.customerId ? updatedCustomer : c
          );

          newMap.set(paginationModel.page, updatedPage);
          return newMap;
        });
      }
    } else {
      const result = await createCustomerMutation({
        variables: { createCustomerInput: input },
      });
      const createdCustomer = result.data?.createCustomer;

      if (createdCustomer) {
        setCustomerPages((prev) => {
          const newMap = new Map(prev);
          const pageData = newMap.get(paginationModel.page) || [];
          const updatedPage = [...pageData, createdCustomer];
          newMap.set(paginationModel.page, updatedPage);
          return newMap;
        });
      }
    }

    await refetch(); // optional: you can remove this if you want to rely purely on local update
    setIsModalOpen(false);
    setEditingCustomer(null);
  } catch (err) {
    toast.error(
      <span>
        🚫 {(err as Error).message}
        <button onClick={() => refetch()}>Retry</button>
      </span>
    );
  }
};




  // ✏️ Edit customer
const handleEditCustomer = useCallback((id: number) => {
  const pageData = customerPages.get(paginationModel.page) || [];
  const customer = pageData.find((c) => c.customerId === id);

  if (customer) {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  }
}, [customerPages, paginationModel.page]);



// 🗑️ Delete Customer
const handleDeleteCustomer = useCallback(
  async (customerId: number) => {
    const pageData = customerPages.get(paginationModel.page) || [];
    const customerToDelete = pageData.find((c) => c.customerId === customerId);
    if (!customerToDelete) return;

    try {
      await deleteCustomerMutation({
        variables: { phone: customerToDelete.phone },
      });

      setCustomerPages((prev) => {
        const newMap = new Map(prev);
        const updatedPage = (newMap.get(paginationModel.page) || []).filter(
          (c) => c.customerId !== customerId
        );
        newMap.set(paginationModel.page, updatedPage);
        return newMap;
      });
    } catch (err) {
      toast.error(`🚫 ${(err as Error).message}`);
    }
  },
  [customerPages, paginationModel.page, deleteCustomerMutation]
);






  // 📊 MUI Rows
const customerRows = useMemo(() => {
  return customerPages.get(paginationModel.page)?.map((cust) => ({
    id: cust.customerId,
    ...cust,
  })) || [];
}, [customerPages, paginationModel.page]);







 // 📄 MUI Columns - actions buttons(edit/delete)
const renderActions = useCallback((params: GridRenderCellParams) => (
  <div className="space-x-2">
    <button onClick={() => handleEditCustomer(params.id as number)} className="text-blue-600 hover:underline">Edit</button>
    <button onClick={() => handleDeleteCustomer(params.id as number)} className="text-red-600 hover:underline">Delete</button>
  </div>
), [handleEditCustomer, handleDeleteCustomer]);

  // 📄 MUI Columns
const customerColumns: GridColDef[] = useMemo(() => [
{ field: "customerId", headerName: "ID", flex: 1 },
  { field: "name", headerName: "Name", flex: 1 },
  { field: "phone", headerName: "Phone", flex: 1 },
  { field: "createdAt", headerName: "Created At", flex: 1, type:"string" },
  { field: "balance", headerName: "Balance", flex: 1 },
  { field: "status", headerName: "Status", flex: 1 },
 { field: "action", headerName: "Action", flex: 1, renderCell: renderActions }

], [renderActions]);













  
  // ✅ Main customer fetch query - server side pagination kar rahy hain ( ar with smart loading using networkstatus)
  const { data,  refetch, networkStatus, error } = useQuery(GET_CUSTOMERS_PAGINATED, {
    variables: {
      page: paginationModel.page + 1,
      limit: Math.max(10, Math.min(paginationModel.pageSize, 100)),
      search: debouncedSearch || undefined,
      status: activeFilter !== "All" ? activeFilter : undefined,
        startDate: startDate || undefined,
  endDate: endDate || undefined,
    },
     fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true, // ✅ Enables `networkStatus` change detection
  });
// Use effect to show toast if query errors out
useEffect(() => {
  if (error) {
    toast.error(`🚫 Failed to load customers: ${error.message}`);
  }
}, [error]);

  
  // ✅ update customer list when data comes from backend
useEffect(() => {
  if (data?.customersPaginated?.data) {
    setCustomerPages((prev) => {
      const newMap = new Map(prev);
      newMap.set(paginationModel.page, data.customersPaginated.data);

            // 👇 Memory Cleanup (LRU-style)
      const activePages = new Set(pageAccessLog);
      for (const key of newMap.keys()) {
        if (!activePages.has(key)) {
          newMap.delete(key);
        }
      }


      return newMap;
    });
  }
}, [data, paginationModel.page, pageAccessLog]);












  

// throttle kr rhy hain - mui ky column par jab user filter kry to type krny ky 4s bd filter work kry
const throttledRefetch = useMemo(() => {
  return throttle(async (vars: RefetchVars) => {
    try {
      await refetch(vars);
     } catch (err) {
      const message = (err as Error).message || "An unknown error occurred.";
      toast.error(`🚫 ${message}`);
    }
  }, 4000);
}, [refetch]);




  // 🔍 Column-wise filtering
useEffect(() => {
  const columnFilters = filterModel.items.reduce((acc, item) => {
    if (item.value) acc.push(item.value.toString());
    return acc;
  }, [] as string[]);

  const combinedColumnSearch = columnFilters.join(" ");
  const fullSearch = [debouncedSearch, combinedColumnSearch]
    .filter(Boolean)
    .join(" ");

  startTransition(() => {
    throttledRefetch({
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
      search: fullSearch || undefined,
      status:
        activeFilter === "Pending Payments"
          ? "Pending"
          : activeFilter === "Received Payments"
          ? "Received"
          : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
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



      <Toaster position="top-center" />







      {/* 🧾 Modal for Add/Edit */}
      <Suspense fallback={<FallbackLoader type="modal" />}>

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
    {name: "status", label: "Status", options: ["Received", "Pending"] },
           ]}
/>
     </Suspense>














      {/* 📦 Party Page Reusable Wrapper */}
      <Suspense fallback={<FallbackLoader type="page" />}>

      <PartyPage
        title={isPending ? "Customers (Loading...)" : "Customers"}
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
                 startTransition(() => {
                 setPaginationModel(newModel);

                     // 👇 LRU log update
                 setPageAccessLog((prevLog) => {
                     const newLog = prevLog.filter(p => p !== newModel.page); // remove duplicate
                     newLog.push(newModel.page);
                    return newLog.length > 10 ? newLog.slice(-10) : newLog; // keep last 10 pages
                 });

                 throttledRefetch({
                     page: newModel.page + 1,
                     limit: newModel.pageSize,
                     search: debouncedSearch || undefined,
                     status: activeFilter !== "All" ? activeFilter : undefined,
              });
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
      </Suspense>
    </>
  );
};

export default Customers;
