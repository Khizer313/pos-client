import { useState } from "react";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import PartyPage from "../PartyPage";
import AddItemModal from "../../components/AddItemModel";

type Brand = {
  name: string;
  createdAt: string;
  status: string;
};

const Brands = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const handleAddBrand = (data: Partial<Brand>) => {
    if (editingIndex !== null) {
      const updated = [...brands];
      updated[editingIndex] = {
        ...updated[editingIndex],
        ...data,
      };
      setBrands(updated);
      setEditingIndex(null);
    } else {
      const newBrand: Brand = {
        name: data.name || "Unnamed Brand",
        createdAt: new Date().toISOString().split("T")[0],
        status: data.status || "Active",
      };
      setBrands([...brands, newBrand]);
    }
  };

  const handleDeleteBrand = (index: number) => {
    const filtered = brands.filter((_, i) => i !== index);
    setBrands(filtered);
  };

  const handleEditBrand = (index: number) => {
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const filteredBrands = brands
    .filter((b) => {
      if (activeFilter === "Active") return b.status === "Active";
      if (activeFilter === "Inactive") return b.status === "Inactive";
      return true;
    })
    .filter((b) => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const brandRows = filteredBrands.map((brand, index) => ({
    id: index,
    name: brand.name,
    createdAt: brand.createdAt,
    status: brand.status,
  }));

  const brandColumns: GridColDef[] = [
    { field: "name", headerName: "Brand Name", flex: 1 },
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
            onClick={() => handleEditBrand(params.id as number)}
          >
            Edit
          </button>
          <button
            className="text-red-600 hover:underline"
            onClick={() => handleDeleteBrand(params.id as number)}
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
        onSubmit={handleAddBrand}
        title={editingIndex !== null ? "Edit Brand" : "Add New Brand"}
        defaultValues={
          editingIndex !== null
            ? {
                name: brands[editingIndex]?.name || "",
                status: brands[editingIndex]?.status || "",
              }
            : {}
        }
        fields={[
          { name: "id", label: "Brand Id", type: "number" },
          { name: "name", label: "Brand Name", type: "text" },
          {
            name: "status",
            label: "Status",
            options: ["Active", "Inactive"],
          },
        ]}
      />

      <PartyPage
        title="Brands"
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
        customTable={
          <div style={{ width: "100%" }}>
            <DataGrid
              rows={brandRows}
              columns={brandColumns}
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

export default Brands;
