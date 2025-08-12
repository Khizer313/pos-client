import { useState } from "react";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import AddItemModal from "../../components/AddItemModel";
import PartyPage from "../PartyPage";

type Category = {
  name: string;
  createdAt: string;
  status: string;
};

const Categories = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const handleAddCategory = (data: Partial<Category>) => {
    if (editingIndex !== null) {
      const updated = [...categories];
      updated[editingIndex] = {
        ...updated[editingIndex],
        ...data,
      };
      setCategories(updated);
      setEditingIndex(null);
    } else {
      const newCategory: Category = {
        name: data.name || "Unnamed Category",
        createdAt: new Date().toISOString().split("T")[0],
        status: data.status || "Active",
      };
      setCategories([...categories, newCategory]);
    }
  };

  const handleDeleteCategory = (index: number) => {
    const filtered = categories.filter((_, i) => i !== index);
    setCategories(filtered);
  };

  const handleEditCategory = (index: number) => {
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const filteredCategories = categories
    .filter((cat) => {
      if (activeFilter === "Active") return cat.status === "Active";
      if (activeFilter === "Inactive") return cat.status === "Inactive";
      return true;
    })
    .filter((cat) => cat.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const categoryRows = filteredCategories.map((cat, index) => ({
    id: index,
    name: cat.name,
    createdAt: cat.createdAt,
    status: cat.status,
  }));

  const categoryColumns: GridColDef[] = [
    { field: "name", headerName: "Category Name", flex: 1 },
    { field: "name", headerName: "Brand Assigned", flex: 1 },
    { field: "createdAt", headerName: "Created At", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "action",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <div className="space-x-2">
          <button
            className="text-blue-600 hover:underline"
            onClick={() => handleEditCategory(params.id as number)}
          >
            Edit
          </button>
          <button
            className="text-red-600 hover:underline"
            onClick={() => handleDeleteCategory(params.id as number)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingIndex(null);
        }}
        onSubmit={handleAddCategory}
        title={editingIndex !== null ? "Edit Category" : "Add New Category"}
        defaultValues={
          editingIndex !== null
            ? {
                name: categories[editingIndex]?.name || "",
                status: categories[editingIndex]?.status || "",
              }
            : {}
        }
        fields={[
          { name: "id", label: "Category Id", type: "number" },
          { name: "name", label: "Category Name", type: "text" },
          { name: "name", label: "Assign To Brand", type: "text" },
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
        onSearchChange={setSearchTerm}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        customTable={
          <div style={{ width: "100%" }}>
            <DataGrid
              rows={categoryRows}
              columns={categoryColumns}
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

export default Categories;
