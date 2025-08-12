import { useState, useEffect, useMemo, useCallback, useTransition, useRef, lazy, Suspense } from "react";
import { type GridColDef, type GridPaginationModel, type GridFilterModel, type GridRenderCellParams } from "@mui/x-data-grid";
import { useMutation, useQuery, NetworkStatus } from "@apollo/client";

import { CREATE_SUPPLIER, UPDATE_SUPPLIER, DELETE_SUPPLIER } from "../../../graphql/mutations/suppliersmutations";
import { GET_SUPPLIERS_PAGINATED } from "../../../graphql/queries/suppliers";

import { Skeleton } from "@mui/material";
import { useDebounce } from "../../../hooks/useDebounce";
import { throttle } from "../../../hooks/useThrottle";
import { useToast } from "../../../components/use-toast";

import FallbackLoader from "../../../components/FallbackLoader";
const AddItemModal = lazy(() => import("../../../components/AddItemModel"));
const PartyPage = lazy(() => import("../../PartyPage"));
const DataGrid = lazy(() => import("@mui/x-data-grid/DataGrid").then(m => ({ default: m.DataGrid })));

import {
  addSuppliersToDexie,
  updateSupplierInDexie,
  clearOldSuppliers,
  getSuppliersFromDexie,
  deleteSupplierFromDexie,
} from "../../../hooks/useSupplierDexie"; // create Dexie hooks similar to customer ones

type Supplier = {
  supplierId: number;
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

const Suppliers = () => {
  const { showToast } = useToast();
  const [supplierPages, setSupplierPages] = useState<Map<number, Supplier[]>>(new Map());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [isPending, startTransition] = useTransition();

  const debouncedSearch = useDebounce(searchTerm, 400);

  // GraphQL mutations
  const [createSupplierMutation] = useMutation(CREATE_SUPPLIER);
  const [updateSupplierMutation] = useMutation(UPDATE_SUPPLIER);
  const [deleteSupplierMutation] = useMutation(DELETE_SUPPLIER);

  const lastRefetchVars = useRef<RefetchVars | null>(null);

  // Add or update supplier
  const handleAddSupplier = async (data: Partial<Supplier>) => {
    const isEditing = editingSupplier !== null;
    const input = {
      name: data.name || "Unnamed",
      phone: data.phone || "0300-0000000",
      balance: data.balance || "PKR 0",
      status: data.status || "Due",
    };

    try {
      if (isEditing && editingSupplier?.supplierId) {
        const result = await updateSupplierMutation({
          variables: {
            supplierId: editingSupplier.supplierId,
            updateSupplierInput: input,
          },
        });
        const updatedSupplier = result.data?.updateSupplier;
        if (updatedSupplier) {
          await updateSupplierInDexie(updatedSupplier);
          await clearOldSuppliers(100);
          setSupplierPages((prev) => {
            const newMap = new Map(prev);
            const pageData = newMap.get(paginationModel.page) || [];
            const updatedPage = pageData.map((s) =>
              s.supplierId === editingSupplier.supplierId ? updatedSupplier : s
            );
            newMap.set(paginationModel.page, updatedPage);
            return newMap;
          });
          showToast("✅ Supplier updated successfully!", "success");
        }
      } else {
        const result = await createSupplierMutation({
          variables: { createSupplierInput: input },
        });
        const createdSupplier = result.data?.createSupplier;
        if (createdSupplier && createdSupplier.supplierId !== undefined) {
          await addSuppliersToDexie([createdSupplier]);
          await clearOldSuppliers(5000);
          setSupplierPages((prev) => {
            const newMap = new Map(prev);
            const firstPageData = newMap.get(0) || [];
            const updatedFirstPage = [createdSupplier, ...firstPageData].slice(0, 10);
            newMap.set(0, updatedFirstPage);
            return newMap;
          });
          setPaginationModel({ page: 0, pageSize: 10 });
          setPaginationModel((prev) => ({ ...prev, page: 0 }));
          showToast("✅ Supplier added successfully!", "success");
        }
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setEditingSupplier(null);
      }, 300);
    } catch (err) {
      showToast(`🚫 ${(err as Error).message}`, "error");
    }
  };

  // Edit supplier
  const handleEditSupplier = useCallback(
    (id: number) => {
      const pageData = supplierPages.get(paginationModel.page) || [];
      const supplier = pageData.find((s) => s.supplierId === id);
      if (supplier) {
        setEditingSupplier(supplier);
        setIsModalOpen(true);
      }
    },
    [supplierPages, paginationModel.page]
  );

  // Delete supplier
  const handleDeleteSupplier = useCallback(
    async (supplierId: number) => {
      try {
        await deleteSupplierMutation({ variables: { supplierId } });
        await deleteSupplierFromDexie(supplierId);
        setSupplierPages((prev) => {
          const newMap = new Map(prev);
          const updatedPage = (newMap.get(paginationModel.page) || []).filter(
            (s) => s.supplierId !== supplierId
          );
          newMap.set(paginationModel.page, updatedPage);
          return newMap;
        });
        showToast("🗑️ Supplier deleted successfully!");
      } catch (err) {
        showToast(`🚫 ${(err as Error).message}`, "error");
      }
    },
    [paginationModel.page, deleteSupplierMutation, showToast]
  );

  // Columns with actions
  const renderActions = useCallback(
    (params: GridRenderCellParams) => (
      <div className="space-x-2">
        <button onClick={() => handleEditSupplier(params.id as number)} className="text-blue-600 hover:underline">
          Edit
        </button>
        <button onClick={() => handleDeleteSupplier(params.id as number)} className="text-red-600 hover:underline">
          Delete
        </button>
      </div>
    ),
    [handleEditSupplier, handleDeleteSupplier]
  );

  const supplierColumns: GridColDef[] = useMemo(
    () => [
      { field: "supplierId", headerName: "ID", flex: 1 },
      { field: "name", headerName: "Name", flex: 1 },
      { field: "phone", headerName: "Phone", flex: 1 },
      {
        field: "createdAt",
        headerName: "Created At",
        flex: 1,
        type: "string",
        renderCell: (params) => {
          const date = new Date(params.value);
          const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Asia/Karachi",
          };
          return date.toLocaleString("en-GB", options).replace(",", "");
        },
      },
      { field: "balance", headerName: "Balance", flex: 1 },
      { field: "status", headerName: "Status", flex: 1 },
      { field: "action", headerName: "Action", flex: 1, renderCell: renderActions },
    ],
    [renderActions]
  );

  // Fetch paginated suppliers with filters, search, dates
  const { data, refetch, networkStatus, error } = useQuery(GET_SUPPLIERS_PAGINATED, {
    variables: {
      page: paginationModel.page + 1,
      limit: Math.max(10, Math.min(paginationModel.pageSize, 100)),
      search: debouncedSearch || undefined,
      status: activeFilter !== "All" ? activeFilter : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    },
    fetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
  });

  // Show error toast on query error
  useEffect(() => {
    if (error) {
      showToast(`🚫 Failed to load suppliers: ${error.message}`, "error");
    }
  }, [error, showToast]);

  // Load supplier pages from API or Dexie fallback
  useEffect(() => {
    const loadSuppliers = async () => {
      if (data?.suppliersPaginated?.data) {
        setSupplierPages((prev) => {
          const newMap = new Map(prev);
          newMap.set(paginationModel.page, data.suppliersPaginated.data);

          // Keep last 10 pages only
          const keys = Array.from(newMap.keys()).sort((a, b) => a - b);
          if (keys.length > 10) {
            for (const key of keys.slice(0, keys.length - 10)) {
              newMap.delete(key);
            }
          }
          return newMap;
        });
      } else if (!data && error) {
        const fallbackSuppliers = await getSuppliersFromDexie();
        const paged = fallbackSuppliers.slice(
          paginationModel.page * paginationModel.pageSize,
          (paginationModel.page + 1) * paginationModel.pageSize
        );
        setSupplierPages((prev) => {
          const newMap = new Map(prev);
          newMap.set(paginationModel.page, paged);
          return newMap;
        });
      }
    };
    loadSuppliers();
  }, [data, error, paginationModel.page, paginationModel.pageSize]);

  lastRefetchVars.current = {
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: debouncedSearch || undefined,
    status:
      activeFilter === "Due"
        ? "Due"
        : activeFilter === "Paid"
        ? "Paid"
        : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  const throttledRefetch = useMemo(() => {
    return throttle(async (vars: RefetchVars) => {
      try {
        await refetch(vars);
      } catch (err) {
        showToast(`🚫 ${(err as Error).message}`, "error");
      }
    }, 1000);
  }, [refetch, showToast]);

  useEffect(() => {
    throttledRefetch({
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
      search: debouncedSearch || undefined,
      status:
        activeFilter === "Due"
          ? "Due"
          : activeFilter === "Paid"
          ? "Paid"
          : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  }, [debouncedSearch, filterModel, activeFilter, paginationModel, throttledRefetch, startDate, endDate]);

  const supplierRows = useMemo(() => {
    const pageData = supplierPages.get(paginationModel.page);
    if (!pageData) return [];
    return pageData.map((sup) => ({
      id: sup.supplierId,
      ...sup,
    }));
  }, [supplierPages, paginationModel.page]);

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
      {isModalOpen && (
        <Suspense fallback={<FallbackLoader type="modal" />}>
          <AddItemModal
            key={editingSupplier?.supplierId || "add"}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingSupplier(null);
            }}
            onSubmit={handleAddSupplier}
            title={editingSupplier ? "Edit Supplier" : "Add New Supplier"}
            defaultValues={
              editingSupplier
                ? {
                    name: editingSupplier.name,
                    phone: editingSupplier.phone,
                    balance: editingSupplier.balance,
                    status: editingSupplier.status,
                  }
                : {}
            }
            fields={[
              { name: "name", label: "Supplier Name", type: "text" },
              { name: "phone", label: "Phone", type: "tel" },
              { name: "balance", label: "Balance", type: "number" },
              { name: "status", label: "Status", options: ["Due", "Paid"] },
            ]}
          />
        </Suspense>
      )}

      <Suspense fallback={<FallbackLoader type="page" />}>
        <PartyPage
          title={isPending ? "Suppliers (Loading...)" : "Suppliers"}
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
                rows={supplierRows}
                columns={supplierColumns}
                getRowId={(row) => row.supplierId}
                paginationModel={paginationModel}
                paginationMode="server"
                onPaginationModelChange={(newModel) => {
                  startTransition(() => {
                    setPaginationModel(newModel);
                  });
                }}
                rowCount={data?.suppliersPaginated?.total || 0}
                pageSizeOptions={[10, 20, 50]}
                filterModel={filterModel}
                onFilterModelChange={setFilterModel}
                checkboxSelection
                disableRowSelectionOnClick
                autoHeight
                loading={networkStatus === NetworkStatus.loading && !supplierPages.get(paginationModel.page)}
              />
            </div>
          }
        />
      </Suspense>
    </>
  );
};

export default Suppliers;
