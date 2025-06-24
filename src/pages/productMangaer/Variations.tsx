import { useState } from "react";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import AddItemModal from "../../components/AddItemModel";
import PartyPage from "../PartyPage";

type Variation = {
  name: string;
  createdAt: string;
  status: string;
};

const Variations = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const handleAddVariation = (data: Partial<Variation>) => {
    if (editingIndex !== null) {
      const updated = [...variations];
      updated[editingIndex] = {
        ...updated[editingIndex],
        ...data,
      };
      setVariations(updated);
      setEditingIndex(null);
    } else {
      const newVariation: Variation = {
        name: data.name || "Unnamed Variation",
        createdAt: new Date().toISOString().split("T")[0],
        status: data.status || "Available",
      };
      setVariations([...variations, newVariation]);
    }
  };

  const handleDeleteVariation = (index: number) => {
    const filtered = variations.filter((_, i) => i !== index);
    setVariations(filtered);
  };

  const handleEditVariation = (index: number) => {
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const filteredVariations = variations
    .filter((v) => {
      if (activeFilter === "Available") return v.status === "Available";
      if (activeFilter === "Out of Stock") return v.status === "Out of Stock";
      return true;
    })
    .filter((v) => v.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const rows = filteredVariations.map((v, index) => ({
    id: index,
    name: v.name,
    createdAt: v.createdAt,
    status: v.status,
  }));

  const columns: GridColDef[] = [
    { field: "name", headerName: "Variation Name", flex: 1 },
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
            onClick={() => handleEditVariation(params.id as number)}
          >
            Edit
          </button>
          <button
            className="text-red-600 hover:underline"
            onClick={() => handleDeleteVariation(params.id as number)}
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
        onSubmit={handleAddVariation}
        title={editingIndex !== null ? "Edit Variation" : "Add New Variation"}
        defaultValues={
          editingIndex !== null
            ? {
                name: variations[editingIndex]?.name || "",
                status: variations[editingIndex]?.status || "",
              }
            : {}
        }
        fields={[
          { name: "id", label: "Variation Id", type: "number" },
          { name: "name", label: "Category Name", type: "text" },
          { name: "name", label: "Variation Name", type: "text" },
          { name: "pieces", label: "Pieces Per Ctn", type: "number" },
          { name: "price", label: "Default Price", type: "number" },
          {
            name: "status",
            label: "Status",
            options: ["Available", "Out of Stock"],
          },
        ]}
      />

      <PartyPage
        title="Variations"
        breadcrumbs={["Dashboard", "Product Manager", "Variations"]}
        buttons={[
          { label: "+ Add New Variation", variant: "primary", onClick: () => setIsModalOpen(true) },
          { label: "Import Variation", variant: "secondary" },
        ]}
        filters={["All", "Available", "Out of Stock"]}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        customTable={
          <div style={{ width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
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

export default Variations;
