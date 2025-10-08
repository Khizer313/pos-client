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

import { GET_VARIATIONS_PAGINATED } from "../../graphql/queries/variations";
import {
  CREATE_VARIATION,
  UPDATE_VARIATION,
  DELETE_VARIATION,
} from "../../graphql/mutations/variationsMutations";

import {
  addVariationsToDexie,
  getVariationsFromDexie,
  updateVariationInDexie,
  deleteVariationFromDexie,
  clearOldVariations,
} from "../../hooks/useVariationsDexie";

type Variation = {
  variationId: number;
  name: string;
  productAssigned: string;
  pieces: number;
  price: number;
  createdAt: string;
  status: string;
};

type Product = { productId: number; name: string };

const Variations = () => {
  const [categories, setProducts] = useState<Product[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariation, setEditingVariation] = useState<Variation | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [variations, setVariations] = useState<Variation[]>([]);
  const variationPages = useRef<Record<number, Variation[]>>({});
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const { loading, data, refetch } = useQuery(GET_VARIATIONS_PAGINATED, {
    variables: {
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
      search: searchTerm || null,
      status: activeFilter !== "All" ? activeFilter : null,
    },
    fetchPolicy: "network-only",
  });

  const [createVariation] = useMutation(CREATE_VARIATION);
  const [updateVariation] = useMutation(UPDATE_VARIATION);
  const [deleteVariation] = useMutation(DELETE_VARIATION);

  const throttledRefetch = useRef(
    throttle((vars: Record<string, unknown>) => refetch(vars), 500)
  ).current;

  // -------------------- Dexie Fallback -------------------- //
  useEffect(() => {
    const fetchDexie = async () => {
      const cached = await getVariationsFromDexie();
      if (cached.length > 0) setVariations(cached);
    };
    fetchDexie();
  }, []);

  // -------------------- Handle New Data -------------------- //
  useEffect(() => {
    if (data?.variationsPaginated?.data) {
      const newVariations = data.variationsPaginated.data;
      variationPages.current[paginationModel.page] = newVariations;
      setVariations(newVariations);
      addVariationsToDexie(newVariations);
      clearOldVariations(500);
    }
  }, [data, paginationModel.page]);

  // -------------------- Pagination -------------------- //
  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
    if (variationPages.current[model.page]) {
      setVariations(variationPages.current[model.page]);
    } else {
      throttledRefetch({
        page: model.page + 1,
        limit: model.pageSize,
        search: searchTerm || null,
        status: activeFilter !== "All" ? activeFilter : null,
      });
    }
  };

  // -------------------- Save Variation -------------------- //
  const handleSaveVariation = async (data: Partial<Variation>) => {
    if (editingVariation) {
      const updated = { ...editingVariation, ...data };
      await updateVariation({
        variables: {
          variationId: updated.variationId,
          updateVariationInput: {
            name: updated.name,
            productAssigned: data.productAssigned?.toString(),
            pieces: Number(data.pieces),
            price: Number(data.price),
            status: updated.status,
          },
        },
      });
      updateVariationInDexie(updated);
    } else {
      const created = await createVariation({
        variables: {
          createVariationInput: {
            name: data.name,
            productAssigned: data.productAssigned?.toString(),
            pieces: Number(data.pieces),
            price: Number(data.price),
            status: data.status,
          },
        },
      });
      if (created.data?.createVariation) addVariationsToDexie([created.data.createVariation]);
    }
    setIsModalOpen(false);
    setEditingVariation(null);
    refetch();
  };

  // -------------------- Delete Variation -------------------- //
  const handleDeleteVariation = async (id: number) => {
    await deleteVariation({ variables: { variationId: id } });
    deleteVariationFromDexie(id);
    refetch();
  };

  // -------------------- Edit Variation -------------------- //
  const handleEditVariation = (variation: Variation) => {
    setEditingVariation(variation);
    setIsModalOpen(true);
  };

  // -------------------- Table Columns -------------------- //
  const columns: GridColDef[] = [
    { field: "variationId", headerName: "Variation Id", flex: 1 },
    { field: "name", headerName: "Variation Name", flex: 1 },
    { field: "productAssigned", headerName: "Assign Product", flex: 1 },
    { field: "pieces", headerName: "Pieces / Pack", flex: 1 },
    { field: "price", headerName: "Price", flex: 1 },
    { field: "createdAt", headerName: "Created At", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "action",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => {
        const row = params.row as Variation;
        return (
          <div className="space-x-2">
            <button
              className="text-blue-600 hover:underline"
              onClick={() => handleEditVariation(row)}
            >
              Edit
            </button>
            <button
              className="text-red-600 hover:underline"
              onClick={() => handleDeleteVariation(row.variationId)}
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
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVariation(null);
        }}
        onSubmit={handleSaveVariation}
        title={editingVariation ? "Edit Variation" : "Add New Variation"}
        defaultValues={
          editingVariation
            ? {
                name: editingVariation.name ?? "",
                productAssigned: editingVariation.productAssigned ?? "",
                pieces: editingVariation.pieces?.toString() ?? "0",
                price: editingVariation.price?.toString() ?? "0",
                status: editingVariation.status ?? "",
              }
            : {}
        }
        fields={[
          { name: "name", label: "Variation Name", type: "text" },
          { name: "productAssigned", label: "Assign Product", type: "select", options: categories.map(p => ({ label: p.name, value: p.productId.toString() })) },
          { name: "pieces", label: "Pieces / Pack", type: "number" },
          { name: "price", label: "Price", type: "number" },
          { name: "status", label: "Status", options: ["Available", "Out of Stock"] },
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
              rows={variations}
              columns={columns}
              getRowId={(row) => row.variationId}
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

export default Variations;
