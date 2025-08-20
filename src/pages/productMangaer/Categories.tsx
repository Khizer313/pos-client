import { useState, useEffect, useRef } from "react";
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from "@mui/x-data-grid";
import { useQuery, useMutation } from "@apollo/client";
import { throttle } from "../../hooks/useThrottle";

import AddItemModal from "../../components/AddItemModel";
import PartyPage from "../PartyPage";

import { GET_CATEGORIES_PAGINATED } from "../../graphql/queries/categories";
import {
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
} from "../../graphql/mutations/caategoriesmutations";
import {
  addCategoriesToDexie,
  getCategoriesFromDexie,
  updateCategoryInDexie,
  deleteCategoryFromDexie,
  clearOldCategories,
} from "../../hooks/useCategories";

import { GET_BRANDS_PAGINATED } from "../../graphql/queries/brands";





// -------------------- Types -------------------- //
// Ye Category aur Brand types define kr rahe hain for TS safety
type Category = {
  categoryId: number;
  name: string;
  brandAssigned?: string;
  createdAt: string;
  status: string;
};
type Brand = {
  brandId: number;
  name: string;
  status: string;
  createdAt: string;
};






// -------------------- Component -------------------- //
const Categories = () => {
  // Dropdown options for brands store krne ke liye state
  const [brands, setBrands] = useState<{ label: string; value: string }[]>([]);

  // Modal open/close aur edit state track krne ke liye
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Search aur filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Categories list aur cached pages ke liye states
  const [categories, setCategories] = useState<Category[]>([]);
  const categoryPages = useRef<Record<number, Category[]>>({}); // Cached pages memory mai rakhnay ke liye

  // Date filter states
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Pagination model (page number + page size control)
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });





  // -------------------- Apollo Queries -------------------- //
  // Categories fetch kr rahe hain GraphQL se with filters + pagination
  const { loading, data, refetch } = useQuery(GET_CATEGORIES_PAGINATED, {
    variables: {
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
      search: searchTerm || null,
      status: activeFilter !== "All" ? activeFilter : null,
      startDate: startDate || null,
      endDate: endDate || null,
    },
    fetchPolicy: "network-only", // Always fresh data laata hai
  });




  // -------------------- Apollo Mutations -------------------- //
  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [updateCategory] = useMutation(UPDATE_CATEGORY);
  const [deleteCategory] = useMutation(DELETE_CATEGORY);




  // -------------------- Throttled Refetch -------------------- //
  // Ye ensure krta hai ke har key stroke pe refetch na ho (debounce style)
  const throttledRefetch = useRef(
    throttle((vars: Record<string, unknown>) => {
      refetch(vars);
    }, 500)
  ).current;




  // -------------------- Brands Query -------------------- //
  const { data: brandData } = useQuery(GET_BRANDS_PAGINATED, {
    variables: { page: 1, limit: 100, search: null, status: "Active" },
  });

  // Brand data ko dropdown options mai map krna
  useEffect(() => {
    if (brandData?.brandsPaginated?.data) {
      const opts = brandData.brandsPaginated.data.map((b: Brand) => ({
        label: b.name,
        value: b.brandId.toString(),
      }));
      setBrands(opts);
    }
  }, [brandData]);





  // -------------------- Dexie (Offline Fallback) -------------------- //
  // Pehle local cache se categories load karlo (agar network na ho to fallback kaam ayega)
  useEffect(() => {
    const fetchDexie = async () => {
      const cached = await getCategoriesFromDexie();
      if (cached.length > 0) {
        setCategories(cached);
      }
    };
    fetchDexie();
  }, []);





  // -------------------- Handle New Data -------------------- //
  // Jab bhi GraphQL se new data aaye to:
  // 1. cache mai save kro
  // 2. Dexie mai add kro (offline access ke liye)
  // 3. Purani entries clean kro (max 500)
  useEffect(() => {
    if (data?.categoriesPaginated?.data) {
      const newCategories = data.categoriesPaginated.data;
      categoryPages.current[paginationModel.page] = newCategories;
      setCategories(newCategories);
      addCategoriesToDexie(newCategories);
      clearOldCategories(500);
    }
  }, [data, paginationModel.page]);





  // -------------------- Pagination Handler -------------------- //
  // Jab user page change kare to check kro cache mai data already hai?
  // agar hai to direct dikhao, warna refetch karo
  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
    if (categoryPages.current[model.page]) {
      setCategories(categoryPages.current[model.page]);
    } else {
      throttledRefetch({
        page: model.page + 1,
        limit: model.pageSize,
        search: searchTerm || null,
        status: activeFilter !== "All" ? activeFilter : null,
      });
    }
  };





  // -------------------- Save Category -------------------- //
  // Ye dono cases handle krta hai:
  // 1. Edit existing category
  // 2. Create new category
  const handleSaveCategory = async (data: Partial<Category>) => {
    if (editingCategory) {
      // --- Update case
      const updated = { ...editingCategory, ...data };
      await updateCategory({
        variables: {
          categoryId: updated.categoryId,
          updateCategoryInput: {
            name: updated.name,
            brandAssigned: data.brandAssigned?.toString(),
            status: updated.status,
          },
        },
      });
      updateCategoryInDexie(updated); // local update bhi karo
    } else {
      // --- Create case
      const created = await createCategory({
        variables: {
          createCategoryInput: {
            name: data.name,
            brandAssigned: data.brandAssigned?.toString(),
            status: data.status,
          },
        },
      });
      if (created.data?.createCategory) {
        addCategoriesToDexie([created.data.createCategory]); // offline add
      }
    }
    // Modal close + cleanup
    setIsModalOpen(false);
    setEditingCategory(null);
    refetch(); // Fresh list fetch
  };




  // -------------------- Delete Category -------------------- //
  const handleDeleteCategory = async (id: number) => {
    await deleteCategory({ variables: { categoryId: id } });
    deleteCategoryFromDexie(id); // offline se bhi delete
    refetch();
  };



  // -------------------- Edit Category -------------------- //
  const handleEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };





  // -------------------- Table Columns -------------------- //
  // DataGrid ke liye column definitions
  const categoryColumns: GridColDef[] = [
    { field: "categoryId", headerName: "Category Id", flex: 1 },
    { field: "name", headerName: "Category Name", flex: 1 },
    {
      field: "brandAssigned",
      headerName: "Brand Assigned",
      flex: 1,
      renderCell: (params) => {
        const brand = brands.find((b) => b.value === params.value);
        return brand ? brand.label : "—";
      },
    },
    { field: "createdAt", headerName: "Created At", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "action",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => {
        const row = params.row as Category;
        return (
          <div className="space-x-2">
            <button
              className="text-blue-600 hover:underline"
              onClick={() => handleEditCategory(row)}
            >
              Edit
            </button>
            <button
              className="text-red-600 hover:underline"
              onClick={() => handleDeleteCategory(row.categoryId)}
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];








  // -------------------- Render -------------------- //
  return (
    <>
      {/* Modal for Add / Edit Category */}
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleSaveCategory}
        title={editingCategory ? "Edit Category" : "Add New Category"}
        defaultValues={
          editingCategory
            ? {
                name: editingCategory.name ?? "",
                brandAssigned: editingCategory.brandAssigned ?? "",
                status: editingCategory.status ?? "",
              }
            : {}
        }
        fields={[
          { name: "name", label: "Category Name", type: "text" },
          {
            name: "brandAssigned",
            label: "Assign To Brand",
            type: "select",
            options: brands,
          },
          {
            name: "status",
            label: "Status",
            options: ["Active", "Inactive"],
          },
        ]}
      />









      {/* PartyPage is main wrapper layout */}
      <PartyPage
        title="Categories"
        breadcrumbs={["Dashboard", "Product Manager", "Categories"]}
        buttons={[
          {
            label: "+ Add New Category",
            variant: "primary",
            onClick: () => setIsModalOpen(true),
          },
          { label: "Import Category", variant: "secondary" },
        ]}
        filters={["All", "Active", "Inactive"]}
        searchTerm={searchTerm}
        onSearchChange={(v) => {
          setSearchTerm(v);
          throttledRefetch({
            page: paginationModel.page + 1,
            limit: paginationModel.pageSize,
            search: v || null,
            status: activeFilter !== "All" ? activeFilter : null,
            startDate: startDate || null,
            endDate: endDate || null,
          });
        }}
        activeFilter={activeFilter}
        onFilterChange={(filter) => {
          setActiveFilter(filter);
          throttledRefetch({
            page: paginationModel.page + 1,
            limit: paginationModel.pageSize,
            search: searchTerm || null,
            status: filter !== "All" ? filter : null,
          });
        }}
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
              rows={categories}
              columns={categoryColumns}
              getRowId={(row) => row.categoryId}
              paginationModel={paginationModel}
              onPaginationModelChange={handlePaginationChange}
              pageSizeOptions={[10, 20, 50]}
              checkboxSelection
              disableRowSelectionOnClick
              autoHeight
              loading={loading}
            />
          </div>
        }
      />
    </>
  );
};

export default Categories;
