
import { useState, useEffect, useMemo, useCallback, useTransition, useRef } from "react";
import {  type GridColDef, type GridPaginationModel, type GridFilterModel, type GridRenderCellParams } from "@mui/x-data-grid";
import { useMutation, useQuery, NetworkStatus } from "@apollo/client";


import { CREATE_CUSTOMER, UPDATE_CUSTOMER, DELETE_CUSTOMER } from "../../../graphql/mutations/customersmutations";
import { GET_CUSTOMERS_PAGINATED } from "../../../graphql/queries/customers";
import { Skeleton } from "@mui/material";

import { useDebounce } from "../../../hooks/useDebounce"; // ✅ Custom hook for debouncing
import { throttle } from "../../../hooks/useThrottle"; // ✅ Add this import
// import DateRangeFilter from "../../../components/DateRangeFilter";
import { useToast } from "../../../components/use-toast";



import { lazy, Suspense } from "react";
import FallbackLoader from "../../../components/FallbackLoader";

const AddItemModal = lazy(() => import("../../../components/AddItemModel"));

import {
  addCustomersToDexie,
  updateCustomerInDexie,
  clearOldCustomers,
  getCustomersFromDexie,
  deleteCustomerFromDexie,
} from "../../../hooks/useCustomerDexie"; 


const PartyPage = lazy(() => import("../../PartyPage"));
const DataGrid = lazy(() => import("@mui/x-data-grid/DataGrid").then(m => ({ default: m.DataGrid })));




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
  const { showToast } = useToast();
  const [customerPages, setCustomerPages] = useState<Map<number, Customer[]>>(new Map());// latest 10 pages paginated cache saved using Map
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 User-typed search term - simple input based search of app 
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] }); // mui filter based search
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null); // editing specific row of customer
  const [isModalOpen, setIsModalOpen] = useState(false);// used for opening/closing additemmodel popup for editing/adding customers rows
  const [activeFilter, setActiveFilter] = useState("All");

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  }); // mui table pagination


  // ✅ Debounced searchTerm (delay firing queries)
  const debouncedSearch = useDebounce(searchTerm, 400);

  // GraphQL Mutations
  const [createCustomerMutation] = useMutation(CREATE_CUSTOMER);
  const [updateCustomerMutation] = useMutation(UPDATE_CUSTOMER);
  const [deleteCustomerMutation] = useMutation(DELETE_CUSTOMER);


const [startDate, setStartDate] = useState<string>("");
const [endDate, setEndDate] = useState<string>("");

const [isPending, startTransition] = useTransition();


// for toast - into handleAddCustomer function
const lastRefetchVars = useRef<RefetchVars | null>(null);







  // ➕ Add or 🔄 Edit Customer
const handleAddCustomer = async (data: Partial<Customer>) => {
  const isEditing = editingCustomer !== null;
  const input = {
    name: data.name || "Unnamed",
    phone: data.phone || "0300-0000000",
    balance: data.balance || "PKR 0",
    status: data.status || "Active",
  };

  try {
    if (isEditing && editingCustomer?.customerId) {
      const result = await updateCustomerMutation({
        variables: {
          customerId: editingCustomer.customerId,
          updateCustomerInput: input,
        },
      });

      const updatedCustomer = result.data?.updateCustomer;
      if (updatedCustomer) {
        await updateCustomerInDexie(updatedCustomer);
        await clearOldCustomers(100);

        setCustomerPages((prev) => {
          const newMap = new Map(prev);
          const pageData = newMap.get(paginationModel.page) || [];
          const updatedPage = pageData.map((c) =>
            c.customerId === editingCustomer.customerId ? updatedCustomer : c
          );
          newMap.set(paginationModel.page, updatedPage);
          return newMap;
        });

          showToast("✅ Customer updated successfully!", "success");
      }
    } else {
      const result = await createCustomerMutation({
        variables: { createCustomerInput: input },
      });

      const createdCustomer = result.data?.createCustomer;
      if (createdCustomer && createdCustomer.customerId !== undefined) {
        await addCustomersToDexie([createdCustomer]);
        await clearOldCustomers(5000);

        setCustomerPages((prev) => {
  const newMap = new Map(prev);
  const firstPageData = newMap.get(0) || [];
  const updatedFirstPage = [createdCustomer, ...firstPageData].slice(0, 10);
  newMap.set(0, updatedFirstPage);
  return newMap;
});
setPaginationModel({ page: 0, pageSize: 10 });


        // ✅ Scroll to page 0 to show new customer
        setPaginationModel((prev) => ({ ...prev, page: 0 }));

        showToast("✅ Customer added successfully!", "success");

      }
    }

    // ✅ Smoothly close modal after short delay
    setTimeout(() => {
      setIsModalOpen(false);
      setEditingCustomer(null);
    }, 300);
  } catch (err) {
showToast(`🚫 ${(err as Error).message}`, "error");


  }
};







  // ✏️ Edit customer - Opens modal for editing by looking up customer in customerPages
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
    try {
      await deleteCustomerMutation({ variables: { customerId } });
      await deleteCustomerFromDexie(customerId); // Dexie sync

      setCustomerPages((prev) => {
        const newMap = new Map(prev);
        const updatedPage = (newMap.get(paginationModel.page) || []).filter(
          (c) => c.customerId !== customerId
        );
        newMap.set(paginationModel.page, updatedPage);
        return newMap;
      });

      showToast("🗑️ Customer deleted successfully!");
    } catch (err) {
      showToast(`🚫 ${(err as Error).message}`, "error");

    }
  },
  [paginationModel.page, deleteCustomerMutation, showToast]
);








  // 📊 MUI Rows
const customerRows = useMemo(() => {
  const pageData = customerPages.get(paginationModel.page);
  if (!pageData) return [];
  return pageData.map((cust) => ({
    id: cust.customerId,
    ...cust,
  }));
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
  { 
    field: "createdAt", 
    headerName: "Created At", 
    flex: 1, 
    type: "string",
    renderCell: (params) => {
      const date = new Date(params.value);
      // Format Pakistan timezone, yyyy-mm-dd HH:mm
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Karachi'
      };
      return date.toLocaleString('en-GB', options).replace(',', '');
    }
  },
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
     fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true, // ✅ Enables `networkStatus` change detection
  });




  
// Use effect to show toast if query errors out
useEffect(() => {
  if (error) {
    showToast(`🚫 Failed to load customers: ${error.message}`, "error");
  }
}, [error, showToast]);

  
  // ✅ update customer list when data comes from backend
useEffect(() => {
  const loadCustomers = async () => {
    if (data?.customersPaginated?.data) {
      console.log("⏬ Loading page", paginationModel.page, "from API");

      setCustomerPages((prev) => {
  const newMap = new Map(prev);

  // only set if current page is not already cached or being updated
  newMap.set(paginationModel.page, data.customersPaginated.data);


  // Only keep 10 recent pages
  const keys = Array.from(newMap.keys()).sort((a, b) => a - b);
  if (keys.length > 10) {
    for (const key of keys.slice(0, keys.length - 10)) {
      newMap.delete(key);
    }
  }

  return newMap;
});

    } else if (!data && error) {
      console.log("🧱 Fallback to Dexie for page", paginationModel.page);

      const fallbackCustomers = await getCustomersFromDexie();
      const paged = fallbackCustomers.slice(
        paginationModel.page * paginationModel.pageSize,
        (paginationModel.page + 1) * paginationModel.pageSize
      );
      setCustomerPages((prev) => {
        const newMap = new Map(prev);
        newMap.set(paginationModel.page, paged);
        return newMap;
      });
    }
  };

  loadCustomers();
}, [data, error, paginationModel.page, paginationModel.pageSize]);












//  Store latest refetch variables before throttledRefetch() - yani data agr ni show hua to refresh krny pr wohi last query ka data show kary ga takeh user ko query dobara nah chalani pary 
  lastRefetchVars.current = {
  page: paginationModel.page + 1,
  limit: paginationModel.pageSize,
  search: debouncedSearch || undefined,
  status: activeFilter === "Pending Payments"
    ? "Pending"
    : activeFilter === "Received Payments"
    ? "Received"
    : undefined,
  startDate: startDate || undefined,
  endDate: endDate || undefined,
};


// throttle kr rhy hain - mui ky column par jab user filter kry to type krny ky 4s bd filter work kry
const throttledRefetch = useMemo(() => {
  return throttle(async (vars: RefetchVars) => {
    try {
      await refetch(vars);
    } catch (err) {
      const message = (err as Error).message || "An unknown error occurred.";
      showToast(`🚫 ${message}`, "error");
    }
  }, 1000);
}, [refetch, showToast]);


useEffect(() => {
  console.log("Page:", paginationModel.page);                     // 🔎 Current page number
  console.log("customerPages:", customerPages);                   // 🧠 Full cached map
  console.log("customerRows:", customerRows);                     // 👀 Current rows shown in UI
  console.log("Apollo Data:", data);                              // 🔄 Fresh data from API
}, [paginationModel.page, customerPages, customerRows, data]);




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
    status: activeFilter === "Pending Payments"
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










      {/* 🧾 Modal for Add/Edit */}
      {isModalOpen && (

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
          )}














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
              rows={customerRows ?? []} 
              columns={customerColumns}
                getRowId={(row) => row.customerId ?? `${row.phone}-${row.createdAt}`} // ✅ FIXED
              paginationModel={paginationModel}
              paginationMode="server"
             onPaginationModelChange={(newModel) => {
  startTransition(() => {
    setPaginationModel(newModel); // that's it.
  });
}}



              rowCount={data?.customersPaginated?.total || 0}
              pageSizeOptions={[10, 20, 50]}
              filterModel={filterModel}
              onFilterModelChange={(model) => setFilterModel(model)}
              checkboxSelection
              disableRowSelectionOnClick
              autoHeight
              loading={networkStatus === NetworkStatus.loading && !customerPages.get(paginationModel.page)}

     />
 </div>
        }
      />
      </Suspense>
    </>
  );
};

export default Customers;
