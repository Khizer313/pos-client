import { useState, useRef, useEffect } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import PartyPage from "../PartyPage";

interface Product {
  productName: string;
  ctn: number;
  pieces: number;
  quantity: number;
  price: number;
  total: number;
}

interface Purchase {
  purchaseId: string;
  supplier: string;
  date: string;
  products: Product[];
  total: string;
  status: string;
}

const Purchase = () => {
  // State
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");

  // Refs for keyboard navigation
  const supplierRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);
  const productNameRef = useRef<HTMLInputElement>(null);
  const ctnRef = useRef<HTMLInputElement>(null);
  const piecesRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);

  // Form state including global date
  const [form, setForm] = useState({
    supplier: "",
    date: new Date().toISOString().split("T")[0], // Date at top, once input by user
    status: "Pending",
    products: [] as Product[],
  });

  const [newProduct, setNewProduct] = useState<Omit<Product, "total">>({
    productName: "",
    ctn: 0,
    pieces: 0,
    quantity: 0,
    price: 0,
  });

  // Focus supplier input when form opens
  useEffect(() => {
    if (showForm) {
      supplierRef.current?.focus();
    }
  }, [showForm]);

  // Auto update quantity = ctn * pieces
  useEffect(() => {
    setNewProduct((prev) => ({
      ...prev,
      quantity: prev.ctn * prev.pieces,
    }));
  }, [newProduct.ctn, newProduct.pieces]);

  // Keyboard navigation helper
  const handleKeyDown = (
    e: React.KeyboardEvent,
    nextRef?: React.RefObject<HTMLElement>,
    currentValue?: string | number,
    isOptional = false
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (
        isOptional ||
        (typeof currentValue === "string" ? currentValue.trim() !== "" : currentValue !== 0 && currentValue !== undefined)
      ) {
        nextRef?.current?.focus();
      }
    }
  };

  // Add or update product
  const handleAddProduct = () => {
    if (!newProduct.productName.trim()) {
      productNameRef.current?.focus();
      return;
    }
    if (newProduct.price <= 0) {
      priceRef.current?.focus();
      return;
    }

    const total = newProduct.quantity * newProduct.price;
    const updatedProducts = [...form.products];

    if (editingProductIndex !== null) {
      updatedProducts[editingProductIndex] = { ...newProduct, total };
    } else {
      updatedProducts.push({ ...newProduct, total });
    }

    setForm({ ...form, products: updatedProducts });
    setNewProduct({ productName: "", ctn: 0, pieces: 0, quantity: 0, price: 0 });
    setEditingProductIndex(null);
    productNameRef.current?.focus();
  };

  // Submit or update purchase
  const handleSubmitPurchase = () => {
    if (!form.supplier.trim()) {
      supplierRef.current?.focus();
      return;
    }
    if (form.products.length === 0) {
      productNameRef.current?.focus();
      return;
    }

    const invoiceTotal = form.products.reduce((acc, p) => acc + p.total, 0);

    const newPurchase: Purchase = {
      purchaseId:
        editingIndex !== null
          ? purchases[editingIndex].purchaseId
          : `PUR${(purchases.length + 1).toString().padStart(3, "0")}`,
      supplier: form.supplier,
      date: form.date, // <-- Use global date from form state
      products: form.products,
      total: invoiceTotal.toFixed(2),
      status: form.status,
    };

    if (editingIndex !== null) {
      setPurchases(purchases.map((p, i) => (i === editingIndex ? newPurchase : p)));
    } else {
      setPurchases([...purchases, newPurchase]);
    }
    resetForm();
  };

  // Reset form, but keep date as is (so user doesn't have to re-enter)
  const resetForm = () => {
    setForm((prev) => ({
      supplier: "",
      date: prev.date, // Keep the selected date
      status: "Pending",
      products: [],
    }));
    setNewProduct({ productName: "", ctn: 0, pieces: 0, quantity: 0, price: 0 });
    setEditingIndex(null);
    setEditingProductIndex(null);
    setShowForm(false);
  };

  // Edit purchase and load its data including date
  const handleEdit = (index: number) => {
    const purchase = purchases[index];
    setForm({
      supplier: purchase.supplier,
      date: purchase.date,
      status: purchase.status,
      products: purchase.products,
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  // Delete purchase with confirmation
  const handleDelete = (index: number) => {
    if (window.confirm("Are you sure you want to delete this purchase?")) {
      setPurchases(purchases.filter((_, i) => i !== index));
    }
  };

  // Filter and search purchases
  const filteredPurchases = purchases
    .filter((p) => activeFilter === "All" || p.status === activeFilter)
    .filter((p) =>
      p.purchaseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Columns for DataGrid
  const columns: GridColDef[] = [
    { field: "purchaseId", headerName: "Purchase ID", flex: 1 },
    { field: "supplier", headerName: "Supplier", flex: 1 },
    { field: "date", headerName: "Date", flex: 1 },
    { field: "total", headerName: "Total", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "action",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <div className="space-x-2">
          <button
            className="text-blue-600 hover:underline"
            onClick={() => handleEdit(params.id as number)}
          >
            Edit
          </button>
          <button
            className="text-red-600 hover:underline"
            onClick={() => handleDelete(params.id as number)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const rows = filteredPurchases.map((p, i) => ({ id: i, ...p }));

  return (
    <PartyPage
      title="Purchases"
      breadcrumbs={["Dashboard", "Purchases"]}
      buttons={[
        {
          label: showForm ? "Close Form" : "+ Add New Purchase",
          variant: "primary",
          onClick: () => setShowForm(!showForm),
        },
      ]}
      filters={["All", "Pending", "Received"]}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      customTable={
        <div className="space-y-6">
          {showForm && (
            <div className="bg-white p-6 rounded shadow border border-gray-200">
              {/* Supplier and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  ref={supplierRef}
                  value={form.supplier}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, dateRef, form.supplier)}
                  placeholder="Supplier Name"
                  className="border px-3 py-2 rounded w-full"
                  required
                />
                <input
                  ref={dateRef}
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, statusRef, form.date)}
                  className="border px-3 py-2 rounded w-full"
                  required
                />
              </div>

              {/* Status */}
              <div className="mt-4">
                <select
                  ref={statusRef}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, productNameRef, form.status)}
                  className="border px-3 py-2 rounded w-full"
                >
                  <option value="Pending">Pending</option>
                  <option value="Received">Received</option>
                </select>
              </div>

              {/* Product Inputs */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-3">
                <input
                  ref={productNameRef}
                  value={newProduct.productName}
                  onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, ctnRef, newProduct.productName)}
                  placeholder="Product Name"
                  className="border px-3 py-2 rounded"
                />
                <input
                  ref={ctnRef}
                  type="number"
                  min={0}
                  value={newProduct.ctn === 0 ? "" : newProduct.ctn}
                  onChange={(e) => setNewProduct({ ...newProduct, ctn: +e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, piecesRef, newProduct.ctn)}
                  placeholder="CTN"
                  className="border px-3 py-2 rounded"
                />
                <input
                  ref={piecesRef}
                  type="number"
                  min={0}
                  value={newProduct.pieces === 0 ? "" : newProduct.pieces}
                  onChange={(e) => setNewProduct({ ...newProduct, pieces: +e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, priceRef, newProduct.pieces)}
                  placeholder="Pieces"
                  className="border px-3 py-2 rounded"
                />
                <input
                  readOnly
                  value={newProduct.quantity}
                  placeholder="Quantity"
                  className="border px-3 py-2 rounded bg-gray-100"
                />
                <input
                  ref={priceRef}
                  type="number"
                  min={0}
                  value={newProduct.price === 0 ? "" : newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: +e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddProduct();
                    }
                  }}
                  placeholder="Price"
                  className="border px-3 py-2 rounded"
                />
                {/* Total readonly input */}
                <input
                  readOnly
                  value={(newProduct.quantity * newProduct.price).toFixed(2)}
                  placeholder="Total"
                  className="border px-3 py-2 rounded bg-gray-100"
                />
              </div>

              <button
                onClick={handleAddProduct}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
              >
                {editingProductIndex !== null ? "Update Product" : "+ Add Product"}
              </button>

              {/* Products list */}
              {form.products.length > 0 && (
                <table className="w-full mt-4 text-left border-t">
                  <thead>
                    <tr>
                      <th className="py-2">Product</th>
                      <th className="py-2">CTN</th>
                      <th className="py-2">Pieces</th>
                      <th className="py-2">Qty</th>
                      <th className="py-2">Price</th>
                      <th className="py-2">Total</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.products.map((p, i) => (
                      <tr key={i} className="border-t">
                        <td className="py-1">{p.productName}</td>
                        <td className="py-1">{p.ctn}</td>
                        <td className="py-1">{p.pieces}</td>
                        <td className="py-1">{p.quantity}</td>
                        <td className="py-1">{p.price}</td>
                        <td className="py-1">{p.total.toFixed(2)}</td>
                        <td className="py-1 space-x-2">
                          <button
                            className="text-blue-600 hover:underline"
                            onClick={() => {
                              setNewProduct({
                                productName: p.productName,
                                ctn: p.ctn,
                                pieces: p.pieces,
                                quantity: p.quantity,
                                price: p.price,
                              });
                              setEditingProductIndex(i);
                              productNameRef.current?.focus();
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-600 hover:underline"
                            onClick={() =>
                              setForm({
                                ...form,
                                products: form.products.filter((_, idx) => idx !== i),
                              })
                            }
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Submit button */}
              <button
                onClick={handleSubmitPurchase}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded"
              >
                {editingIndex !== null ? "Update Purchase" : "Submit Purchase"}
              </button>
            </div>
          )}

          {/* Purchases Table */}
          <div className="bg-white rounded border shadow">
            <DataGrid rows={rows} columns={columns} autoHeight pageSizeOptions={[10]} />
          </div>
        </div>
      }
    />
  );
};

export default Purchase;
