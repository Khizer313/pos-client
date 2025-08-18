import { useState, useEffect, useCallback, useRef } from "react";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import { useQuery, useMutation } from "@apollo/client";
import { throttle } from "../../hooks/useThrottle";

import AddItemModal from "../../components/AddItemModel";
import PartyPage from "../PartyPage";

import { GET_CATEGORIES_PAGINATED } from "../../graphql/queries/categories";
import { CREATE_CATEGORY, UPDATE_CATEGORY, DELETE_CATEGORY } from "../../graphql/mutations/caategoriesmutations";
import {
  addCategoriesToDexie,
  getCategoriesFromDexie,
  updateCategoryInDexie,
  deleteCategoryFromDexie,
  clearOldCategories,
} from "../../hooks/useCategories";

import { GET_BRANDS_PAGINATED } from "../../graphql/queries/brands";


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
  const [brands, setBrands] = useState<{ label: string; value: string }[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [categories, setCategories] = useState<Category[]>([]);
  const categoryPages = useRef<Record<number, Category[]>>({}); // cached pages

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  // Apollo Queries
  const { loading, data, refetch } = useQuery(GET_CATEGORIES_PAGINATED, {
    variables: {
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
      search: searchTerm || null,
      status: activeFilter !== "All" ? activeFilter : null,
    },
    fetchPolicy: "network-only",
  });

  // Apollo Mutations
  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [updateCategory] = useMutation(UPDATE_CATEGORY);
  const [deleteCategory] = useMutation(DELETE_CATEGORY);

  // Throttled refetch
  const throttledRefetch = useCallback(
    throttle((vars: Record<string, unknown>) => {
  refetch(vars);
}, 500)
,
    []
  );




  // --- Query for Brands ---
const { data: brandData } = useQuery(GET_BRANDS_PAGINATED, {
  variables: { page: 1, limit: 100, search: null, status: "Active" },
});

// --- Effect to set brands dropdown ---
useEffect(() => {
  if (brandData?.brandsPaginated?.data) {
    const opts = brandData.brandsPaginated.data.map((b: Brand) => ({
      label: b.name,
      value: b.brandId.toString(),
    }));
    setBrands(opts);
  }
}, [brandData]);






  // Dexie fallback
  useEffect(() => {
    const fetchDexie = async () => {
      const cached = await getCategoriesFromDexie();
      if (cached.length > 0) {
        setCategories(cached);
      }
    };
    fetchDexie();
  }, []);

  // When new GraphQL data arrives
  useEffect(() => {
    if (data?.categoriesPaginated?.data) {
      const newCategories = data.categoriesPaginated.data;
      categoryPages.current[paginationModel.page] = newCategories;
      setCategories(newCategories);
      addCategoriesToDexie(newCategories);
      clearOldCategories(500); // keep max 500 categories
    }
  }, [data, paginationModel.page]);

  // Pagination change
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

  // Add / Edit Category
 const handleSaveCategory = async (data: Partial<Category>) => {
  if (editingCategory) {
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
    updateCategoryInDexie(updated);
  } else {
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
      addCategoriesToDexie([created.data.createCategory]);
    }
  }
  setIsModalOpen(false);
  setEditingCategory(null);
  refetch();
};


  // Delete
  const handleDeleteCategory = async (id: number) => {
    await deleteCategory({ variables: { categoryId: id } });
    deleteCategoryFromDexie(id);
    refetch();
  };

  // Edit
  const handleEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  // Table columns
  const categoryColumns: GridColDef[] = [
    { field: "categoryId", headerName: "Category Id", flex: 1 },
    { field: "name", headerName: "Category Name", flex: 1 },
    { field: "brandAssigned", headerName: "Brand Assigned", flex: 1 },
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
            <button className="text-blue-600 hover:underline" onClick={() => handleEditCategory(row)}>
              Edit
            </button>
            <button className="text-red-600 hover:underline" onClick={() => handleDeleteCategory(row.categoryId)}>
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
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

      <PartyPage
        title="Categories"
        breadcrumbs={["Dashboard", "Product Manager", "Categories"]}
        buttons={[
          { label: "+ Add New Category", variant: "primary", onClick: () => setIsModalOpen(true) },
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
