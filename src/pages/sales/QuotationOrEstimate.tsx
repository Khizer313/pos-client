import { useState, useRef } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import PartyPage from "../PartyPage";

interface QuotationProduct {
  productName: string;
  ctn: number;
  pieces: number;
  quantity: number;
  price: number;
  total: number;
}

interface Quotation {
  quoteNo: string;
  customer: string;
  date: string;
  products: QuotationProduct[];
  total: number;
  status: string;
}

const QuotationOrEstimate = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Refs for keyboard navigation
  const customerRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);
  const productNameRef = useRef<HTMLInputElement>(null);
  const ctnRef = useRef<HTMLInputElement>(null);
  const piecesRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);

  // Form state
  const [form, setForm] = useState<Omit<Quotation, "total" | "quoteNo">>({
    customer: "",
    date: new Date().toISOString().split("T")[0],
    products: [],
    status: "Pending",
  });

  const [newProduct, setNewProduct] = useState<Omit<QuotationProduct, "total" | "quantity">>({
    productName: "",
    ctn: 0,
    pieces: 0,
    price: 0,
  });

  const quantity = newProduct.ctn * newProduct.pieces;
  const total = quantity * newProduct.price;

  // Enter key navigation helper
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
        (typeof currentValue === "string" ? currentValue.trim() !== "" : currentValue !== 0)
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

    const product: QuotationProduct = {
      ...newProduct,
      quantity,
      total,
    };

    let updatedProducts = [...form.products];
    const existingIndex = updatedProducts.findIndex((p) => p.productName === product.productName);

    if (existingIndex !== -1) {
      updatedProducts[existingIndex] = product;
    } else {
      updatedProducts.push(product);
    }

    setForm((prev) => ({ ...prev, products: updatedProducts }));
    setNewProduct({ productName: "", ctn: 0, pieces: 0, price: 0 });
    productNameRef.current?.focus();
  };

  const handleDeleteProduct = (index: number) => {
    setForm((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  // Submit or update quotation with auto quoteNo generation
  const handleSubmitQuotation = () => {
    if (!form.customer.trim()) {
      customerRef.current?.focus();
      return;
    }
    if (form.products.length === 0) {
      productNameRef.current?.focus();
      return;
    }

    // Auto-generate quoteNo only if new quotation (not editing)
    let newQuoteNo = "";
    if (editingIndex === null) {
      const existingNumbers = quotations
        .map((q) => {
          const match = q.quoteNo.match(/QTN(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        });
      const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
      newQuoteNo = `QTN${(maxNumber + 1).toString().padStart(3, "0")}`;
    } else {
      newQuoteNo = quotations[editingIndex].quoteNo;
    }

    const totalSum = form.products.reduce((acc, p) => acc + p.total, 0);

    const newQuotation: Quotation = {
      ...form,
      quoteNo: newQuoteNo,
      total: totalSum,
    };

    if (editingIndex !== null) {
      setQuotations((prev) => prev.map((q, i) => (i === editingIndex ? newQuotation : q)));
    } else {
      setQuotations((prev) => [...prev, newQuotation]);
    }

    resetForm();
  };

  const resetForm = () => {
    setForm({
      customer: "",
      date: new Date().toISOString().split("T")[0],
      products: [],
      status: "Pending",
    });
    setNewProduct({ productName: "", ctn: 0, pieces: 0, price: 0 });
    setEditingIndex(null);
    setShowForm(false);
  };

  const handleEditQuotation = (index: number) => {
    const q = quotations[index];
    setForm({
      customer: q.customer,
      date: q.date,
      products: q.products,
      status: q.status,
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDeleteQuotation = (index: number) => {
    if (window.confirm("Are you sure you want to delete this quotation?")) {
      setQuotations((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Filtering and searching
  const filteredQuotations = quotations
    .filter((q) => activeFilter === "All" || q.status === activeFilter)
    .filter(
      (q) =>
        q.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.quoteNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const rows = filteredQuotations.map((q, i) => ({
    id: i,
    quoteNo: q.quoteNo,
    customer: q.customer,
    date: q.date,
    total: q.total.toFixed(2),
    status: q.status,
  }));

  const columns: GridColDef[] = [
    { field: "quoteNo", headerName: "Quote No", flex: 1 },
    { field: "customer", headerName: "Customer", flex: 1 },
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
            onClick={() => handleEditQuotation(params.id as number)}
          >
            Edit
          </button>
          <button
            className="text-red-600 hover:underline"
            onClick={() => handleDeleteQuotation(params.id as number)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <PartyPage
      title="Quotation / Estimate"
      breadcrumbs={["Dashboard", "Sales", "Quotation / Estimate"]}
      buttons={[
        {
          label: showForm ? "Close Form" : "+ New Quotation",
          variant: "primary",
          onClick: () => (showForm ? resetForm() : setShowForm(true)),
        },
      ]}
      filters={["All", "Approved", "Pending", "Rejected"]}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      customTable={
        <div className="space-y-6">
          {showForm && (
            <div className="bg-white p-6 rounded shadow border border-gray-200">
              {/* Customer & Date & Status */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  ref={customerRef}
                  value={form.customer}
                  onChange={(e) => setForm({ ...form, customer: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, dateRef, form.customer)}
                  placeholder="Customer Name"
                  className="border px-3 py-2 rounded w-full"
                  autoFocus
                />
                <input
                  ref={dateRef}
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, statusRef, form.date)}
                  className="border px-3 py-2 rounded w-full"
                />
                <select
                  ref={statusRef}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, productNameRef, form.status)}
                  className="border px-3 py-2 rounded w-full"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <div></div> {/* empty for grid balance */}
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
                  value={newProduct.ctn}
                  onChange={(e) => setNewProduct({ ...newProduct, ctn: +e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, piecesRef, newProduct.ctn)}
                  placeholder="CTN"
                  min={0}
                  className="border px-3 py-2 rounded"
                />
                <input
                  ref={piecesRef}
                  type="number"
                  value={newProduct.pieces}
                  onChange={(e) => setNewProduct({ ...newProduct, pieces: +e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, priceRef, newProduct.pieces)}
                  placeholder="Pieces"
                  min={0}
                  className="border px-3 py-2 rounded"
                />
                <input
                  readOnly
                  value={quantity}
                  placeholder="Quantity"
                  className="border px-3 py-2 rounded bg-gray-100"
                />
                <input
                  ref={priceRef}
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: +e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, undefined, newProduct.price, true)}
                  placeholder="Price"
                  min={0}
                  className="border px-3 py-2 rounded"
                />
                <button onClick={handleAddProduct} className="bg-blue-600 text-white rounded px-4 py-2">
                  + Add Product
                </button>
              </div>

              {/* Products Table */}
              {form.products.length > 0 && (
                <table className="w-full mt-4 border-t text-left">
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
                                price: p.price,
                              });
                              productNameRef.current?.focus();
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-600 hover:underline"
                            onClick={() => handleDeleteProduct(i)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Total & Submit */}
              <div className="mt-4 flex justify-between items-center">
                <div className="font-semibold text-lg">
                  Total: {form.products.reduce((acc, p) => acc + p.total, 0).toFixed(2)}
                </div>
                <button
                  onClick={handleSubmitQuotation}
                  className="bg-green-600 text-white rounded px-6 py-2"
                >
                  {editingIndex !== null ? "Update Quotation" : "Submit Quotation"}
                </button>
              </div>
            </div>
          )}

          {/* Data Grid */}
          <div className="bg-white rounded border shadow">
            <DataGrid
              rows={rows}
              columns={columns}
              autoHeight
              pageSizeOptions={[10, 20, 50]}
              checkboxSelection
              disableRowSelectionOnClick
            />
          </div>
        </div>
      }
    />
  );
};

export default QuotationOrEstimate;
