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

import { GET_PRODUCTS_PAGINATED } from "../../graphql/queries/products";
import {
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
} from "../../graphql/mutations/productsmutations";

import {
  addProductsToDexie,
  getProductsFromDexie,
  updateProductInDexie,
  deleteProductFromDexie,
  clearOldProducts,
} from "../../hooks/useProductsDexie";

import { GET_CATEGORIES_PAGINATED } from "../../graphql/queries/categories";


// -------------------- Types -------------------- //
type Product = {
  productId: number;
  name: string;
  categoryAssigned: string;
  pieces: number;
  price: number;
  createdAt: string;
  status: string;
  
};

type Category = {
  categoryId: number;
  name: string;
};


// -------------------- Component -------------------- //
const Products = () => {
  // Dropdown options for categories
  const [categories, setCategories] = useState<{ label: string; value: string }[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Product list + pagination
  const [products, setProducts] = useState<Product[]>([]);
  const productPages = useRef<Record<number, Product[]>>({});
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  // Date filters
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // -------------------- Apollo Queries -------------------- //
  const { loading, data, refetch } = useQuery(GET_PRODUCTS_PAGINATED, {
    variables: {
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
      search: searchTerm || null,
      status: activeFilter !== "All" ? activeFilter : null,
      startDate: startDate || null,
      endDate: endDate || null,
    },
    fetchPolicy: "network-only",
  });

  // Mutations
  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [deleteProduct] = useMutation(DELETE_PRODUCT);

  // Throttled refetch
  const throttledRefetch = useRef(
    throttle((vars: Record<string, unknown>) => {
      refetch(vars);
    }, 500)
  ).current;

  // -------------------- Categories Query -------------------- //
  const { data: categoryData } = useQuery(GET_CATEGORIES_PAGINATED, {
    variables: { page: 1, limit: 100, search: null, status: "Active" },
  });

  useEffect(() => {
    if (categoryData?.categoriesPaginated?.data) {
      const opts = categoryData.categoriesPaginated.data.map((c: Category) => ({
        label: c.name,
        value: c.categoryId.toString(),
      }));
      setCategories(opts);
    }
  }, [categoryData]);

  // -------------------- Dexie Fallback -------------------- //
  useEffect(() => {
    const fetchDexie = async () => {
      const cached = await getProductsFromDexie();
      if (cached.length > 0) {
        setProducts(cached);
      }
    };
    fetchDexie();
  }, []);

  // -------------------- Handle New Data -------------------- //
  useEffect(() => {
    if (data?.productsPaginated?.data) {
      const newProducts = data.productsPaginated.data;
      productPages.current[paginationModel.page] = newProducts;
      setProducts(newProducts);
      addProductsToDexie(newProducts);
      clearOldProducts(500);
    }
  }, [data, paginationModel.page]);

  // -------------------- Pagination -------------------- //
  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
    if (productPages.current[model.page]) {
      setProducts(productPages.current[model.page]);
    } else {
      throttledRefetch({
        page: model.page + 1,
        limit: model.pageSize,
        search: searchTerm || null,
        status: activeFilter !== "All" ? activeFilter : null,
      });
    }
  };

  // -------------------- Save Product -------------------- //
  const handleSaveProduct = async (data: Partial<Product>) => {
  if (editingProduct) {
    const updated = { ...editingProduct, ...data };
    await updateProduct({
      variables: {
        productId: updated.productId,
        updateProductInput: {
          name: updated.name,
          categoryAssigned: data.categoryAssigned?.toString(),
          pieces: Number(updated.pieces), // ✅ pieces -> stock
          price: Number(updated.price),  // ✅ string -> number
          status: updated.status,
        },
      },
    });
    updateProductInDexie(updated);
  } else {
    const created = await createProduct({
      variables: {
        createProductInput: {
          name: data.name,
          categoryAssigned: data.categoryAssigned?.toString(),
          pieces: Number(data.pieces),   // ✅ pieces -> stock
          price: Number(data.price),    // ✅ string -> number
          status: data.status,
        },
      },
    });
    if (created.data?.createProduct) {
      addProductsToDexie([created.data.createProduct]);
    }
  }
  setIsModalOpen(false);
  setEditingProduct(null);
  refetch();
};


  // -------------------- Delete Product -------------------- //
  const handleDeleteProduct = async (id: number) => {
    await deleteProduct({ variables: { productId: id } });
    deleteProductFromDexie(id);
    refetch();
  };

  // -------------------- Edit Product -------------------- //
  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsModalOpen(true);
  };

  // -------------------- Table Columns -------------------- //
  const productColumns: GridColDef[] = [
    { field: "productId", headerName: "Product Id", flex: 1 },
    { field: "name", headerName: "Product Name", flex: 1 },
    {
      field: "categoryAssigned",
      headerName: "Category Assigned",
      flex: 1,
      renderCell: (params) => {
        const cat = categories.find((c) => c.value === params.value);
        return cat ? cat.label : "—";
      },
    },
    { field: "pieces", headerName: "Pieces / Pack", flex: 1 },
    { field: "price", headerName: "Price", flex: 1 },
    { field: "createdAt", headerName: "Created At", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "action",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => {
        const row = params.row as Product;
        return (
          <div className="space-x-2">
            <button
              className="text-blue-600 hover:underline"
              onClick={() => handleEditProduct(row)}
            >
              Edit
            </button>
            <button
              className="text-red-600 hover:underline"
              onClick={() => handleDeleteProduct(row.productId)}
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
      {/* Modal for Add / Edit Product */}
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSaveProduct}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        defaultValues={
          editingProduct
            ? {
                name: editingProduct.name ?? "",
                categoryAssigned: editingProduct.categoryAssigned ?? "",
       
                        pieces: editingProduct.pieces?.toString() ?? "0", 
        price: editingProduct.price?.toString() ?? "0", 
                status: editingProduct.status ?? "",
              }
            : {}
        }
        fields={[
          { name: "name", label: "Product Name", type: "text" },
          {
            name: "categoryAssigned",
            label: "Assign To Category",
            type: "select",
            options: categories,
          },
          { name: "pieces", label: "Pieces Per Pack", type: "number" },
          { name: "price", label: "Price", type: "number" },
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
          {
            label: "+ Add New Product",
            variant: "primary",
            onClick: () => setIsModalOpen(true),
          },
          { label: "Import Product", variant: "secondary" },
        ]}
        filters={["All", "In Stock", "Out of Stock"]}
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
              rows={products}
              columns={productColumns}
              getRowId={(row) => row.productId}
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

export default Products;
