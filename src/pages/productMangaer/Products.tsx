import { useState } from "react";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import AddItemModal from "../../components/AddItemModel";
import PartyPage from "../PartyPage";

type Product = {
  name: string;
  category: string;
  price: string;
  status: string;
};

const Products = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const handleAddProduct = (data: Partial<Product>) => {
    if (editingIndex !== null) {
      const updated = [...products];
      updated[editingIndex] = { ...updated[editingIndex], ...data };
      setProducts(updated);
      setEditingIndex(null);
    } else {
      const newProduct: Product = {
        name: data.name || "Unnamed Product",
        category: data.category || "Uncategorized",
        price: data.price || "$0",
        status: data.status || "In Stock",
      };
      setProducts([...products, newProduct]);
    }
  };

  const handleDeleteProduct = (index: number) => {
    const filtered = products.filter((_, i) => i !== index);
    setProducts(filtered);
  };

  const handleEditProduct = (index: number) => {
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const filteredProducts = products
    .filter((p) => {
      if (activeFilter === "In Stock") return p.status === "In Stock";
      if (activeFilter === "Out of Stock") return p.status === "Out of Stock";
      return true;
    })
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const rows = filteredProducts.map((p, index) => ({
    id: index,
    name: p.name,
    category: p.category,
    price: p.price,
    status: p.status,
  }));

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },
    { field: "price", headerName: "Price", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "action",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <div className="space-x-2">
          <button
            className="text-blue-600 hover:underline"
            onClick={() => handleEditProduct(params.id as number)}
          >
            Edit
          </button>
          <button
            className="text-red-600 hover:underline"
            onClick={() => handleDeleteProduct(params.id as number)}
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
        onSubmit={handleAddProduct}
        title={editingIndex !== null ? "Edit Product" : "Add New Product"}
        defaultValues={
          editingIndex !== null
            ? {
                name: products[editingIndex]?.name || "",
                category: products[editingIndex]?.category || "",
                price: products[editingIndex]?.price || "",
                status: products[editingIndex]?.status || "",
              }
            : {}
        }
        fields={[
          { name: "id", label: "Product Id", type: "number" },
          { name: "name", label: "Category Name", type: "text" },
          { name: "name", label: "Product Name", type: "text" },
          { name: "pieces", label: "Pieces Per Ctn", type: "number" },
          { name: "price", label: "Default Price", type: "number" },
          {
            name: "status",
            label: "Status",
            options: ["In Stock", "Out of Stock"],
          },
        ]}
      />

      <PartyPage
        title="Products"
        breadcrumbs={["Dashboard", "Product Manager", "Products"]}
        buttons={[
          { label: "+ Add New Product", variant: "primary", onClick: () => setIsModalOpen(true) },
          { label: "Import Product", variant: "secondary" },
        ]}
        filters={["All", "In Stock", "Out of Stock"]}
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

export default Products;
