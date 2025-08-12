import { useState, useEffect, useMemo, useCallback, useTransition, useRef, lazy, Suspense } from "react";
import {
  type GridColDef,
  type GridPaginationModel,
  type GridFilterModel,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import { useMutation, useQuery, NetworkStatus } from "@apollo/client";

import {
  CREATE_BRAND,
  UPDATE_BRAND,
  DELETE_BRAND,
} from "../../graphql/mutations/brandmutations";
import { GET_BRANDS_PAGINATED } from "../../graphql/queries/brands";

import { Skeleton } from "@mui/material";
import { useDebounce } from "../../hooks/useDebounce";
import { throttle } from "../../hooks/useThrottle";
import { useToast } from "../../components/use-toast";

import FallbackLoader from "../../components/FallbackLoader";
const AddItemModal = lazy(() => import("../../components/AddItemModel"));
const PartyPage = lazy(() => import("../PartyPage"));

const DataGrid = lazy(() =>
  import("@mui/x-data-grid/DataGrid").then((m) => ({ default: m.DataGrid }))
);

import {
  addBrandsToDexie,
  updateBrandInDexie,
  clearOldBrands,
  getBrandsFromDexie,
  deleteBrandFromDexie,
} from "../../hooks/useBrandDexie"; // Make this similar to useSupplierDexie

type Brand = {
  brandId: number;
  name: string;
  createdAt: string;
  status: string;
  startDate?: string;
  endDate?: string;
};

type RefetchVars = {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
};

const Brands = () => {
  const { showToast } = useToast();
  const [brandPages, setBrandPages] = useState<Map<number, Brand[]>>(new Map());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
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
  const [createBrandMutation] = useMutation(CREATE_BRAND);
  const [updateBrandMutation] = useMutation(UPDATE_BRAND);
  const [deleteBrandMutation] = useMutation(DELETE_BRAND);

  const lastRefetchVars = useRef<RefetchVars | null>(null);

  // Add or update brand
  const handleAddBrand = async (data: Partial<Brand>) => {
    const isEditing = editingBrand !== null;
    const input = {
      name: data.name || "Unnamed",
      status: data.status || "Active",
    };

    try {
      if (isEditing && editingBrand?.brandId) {
        const result = await updateBrandMutation({
          variables: {
            brandId: editingBrand.brandId,
            updateBrandInput: input,
          },
        });
        const updatedBrand = result.data?.updateBrand;
        if (updatedBrand) {
          await updateBrandInDexie(updatedBrand);
          await clearOldBrands(100);
          setBrandPages((prev) => {
            const newMap = new Map(prev);
            const pageData = newMap.get(paginationModel.page) || [];
            const updatedPage = pageData.map((b) =>
              b.brandId === editingBrand.brandId ? updatedBrand : b
            );
            newMap.set(paginationModel.page, updatedPage);
            return newMap;
          });
          showToast("✅ Brand updated successfully!", "success");
        }
      } else {
        const result = await createBrandMutation({
          variables: { createBrandInput: input },
        });
        const createdBrand = result.data?.createBrand;
        if (createdBrand && createdBrand.brandId !== undefined) {
          await addBrandsToDexie([createdBrand]);
          await clearOldBrands(5000);
          setBrandPages((prev) => {
            const newMap = new Map(prev);
            const firstPageData = newMap.get(0) || [];
            const updatedFirstPage = [createdBrand, ...firstPageData].slice(0, 10);
            newMap.set(0, updatedFirstPage);
            return newMap;
          });
          setPaginationModel({ page: 0, pageSize: 10 });
          showToast("✅ Brand added successfully!", "success");
        }
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setEditingBrand(null);
      }, 300);
    } catch (err) {
      showToast(`🚫 ${(err as Error).message}`, "error");
    }
  };

  // Edit brand
  const handleEditBrand = useCallback(
    (id: number) => {
      const pageData = brandPages.get(paginationModel.page) || [];
      const brand = pageData.find((b) => b.brandId === id);
      if (brand) {
        setEditingBrand(brand);
        setIsModalOpen(true);
      }
    },
    [brandPages, paginationModel.page]
  );

  // Delete brand
  const handleDeleteBrand = useCallback(
    async (brandId: number) => {
      try {
        await deleteBrandMutation({ variables: { brandId } });
        await deleteBrandFromDexie(brandId);
        setBrandPages((prev) => {
          const newMap = new Map(prev);
          const updatedPage = (newMap.get(paginationModel.page) || []).filter(
            (b) => b.brandId !== brandId
          );
          newMap.set(paginationModel.page, updatedPage);
          return newMap;
        });
        showToast("🗑️ Brand deleted successfully!");
      } catch (err) {
        showToast(`🚫 ${(err as Error).message}`, "error");
      }
    },
    [paginationModel.page, deleteBrandMutation, showToast]
  );

  // Columns with actions
  const renderActions = useCallback(
    (params: GridRenderCellParams) => (
      <div className="space-x-2">
        <button
          onClick={() => handleEditBrand(params.id as number)}
          className="text-blue-600 hover:underline"
        >
          Edit
        </button>
        <button
          onClick={() => handleDeleteBrand(params.id as number)}
          className="text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>
    ),
    [handleEditBrand, handleDeleteBrand]
  );

  const brandColumns: GridColDef[] = useMemo(
    () => [
      { field: "brandId", headerName: "ID", flex: 1 },
      { field: "name", headerName: "Name", flex: 1 },
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
      { field: "status", headerName: "Status", flex: 1 },
      { field: "action", headerName: "Action", flex: 1, renderCell: renderActions },
    ],
    [renderActions]
  );

  // Fetch paginated brands with filters, search, dates
  const { data, refetch, networkStatus, error } = useQuery(GET_BRANDS_PAGINATED, {
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
      showToast(`🚫 Failed to load brands: ${error.message}`, "error");
    }
  }, [error, showToast]);

  // Load brand pages from API or Dexie fallback
  useEffect(() => {
    const loadBrands = async () => {
      if (data?.brandsPaginated?.data) {
        setBrandPages((prev) => {
          const newMap = new Map(prev);
          newMap.set(paginationModel.page, data.brandsPaginated.data);

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
        const fallbackBrands = await getBrandsFromDexie();
        const paged = fallbackBrands.slice(
          paginationModel.page * paginationModel.pageSize,
          (paginationModel.page + 1) * paginationModel.pageSize
        );
        setBrandPages((prev) => {
          const newMap = new Map(prev);
          newMap.set(paginationModel.page, paged);
          return newMap;
        });
      }
    };
    loadBrands();
  }, [data, error, paginationModel.page, paginationModel.pageSize]);

  lastRefetchVars.current = {
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: debouncedSearch || undefined,
    status: activeFilter !== "All" ? activeFilter : undefined,
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
      status: activeFilter !== "All" ? activeFilter : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  }, [
    debouncedSearch,
    filterModel,
    activeFilter,
    paginationModel,
    throttledRefetch,
    startDate,
    endDate,
  ]);

  const brandRows = useMemo(() => {
    const pageData = brandPages.get(paginationModel.page);
    if (!pageData) return [];
    return pageData.map((b) => ({
      id: b.brandId,
      ...b,
    }));
  }, [brandPages, paginationModel.page]);

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
            key={editingBrand?.brandId || "add"}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingBrand(null);
            }}
            onSubmit={handleAddBrand}
            title={editingBrand ? "Edit Brand" : "Add New Brand"}
            defaultValues={
              editingBrand
                ? {
                    name: editingBrand.name,
                    status: editingBrand.status,
                   
                  }
                : {}
            }
            fields={[
              { name: "name", label: "Brand Name", type: "text" },
            
              {
                name: "status",
                label: "Status",
                options: ["Active", "Inactive"],
              },
            ]}
          />
        </Suspense>
      )}

      <Suspense fallback={<FallbackLoader type="page" />}>
        <PartyPage
          title={isPending ? "Brands (Loading...)" : "Brands"}
          breadcrumbs={["Dashboard", "Product Manager", "Brands"]}
          buttons={[
            { label: "+ Add New Brand", variant: "primary", onClick: () => setIsModalOpen(true) },
            { label: "Import Brand", variant: "secondary" },
          ]}
          filters={["All", "Active", "Inactive"]}
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
                rows={brandRows}
                columns={brandColumns}
                getRowId={(row) => row.brandId}
                paginationModel={paginationModel}
                paginationMode="server"
                onPaginationModelChange={(newModel) => {
                  startTransition(() => {
                    setPaginationModel(newModel);
                  });
                }}
                rowCount={data?.brandsPaginated?.total || 0}
                pageSizeOptions={[10, 20, 50]}
                filterModel={filterModel}
                onFilterModelChange={setFilterModel}
                checkboxSelection
                disableRowSelectionOnClick
                autoHeight
                loading={
                  networkStatus === NetworkStatus.loading &&
                  !brandPages.get(paginationModel.page)
                }
              />
            </div>
          }
        />
      </Suspense>
    </>
  );
};

export default Brands;
