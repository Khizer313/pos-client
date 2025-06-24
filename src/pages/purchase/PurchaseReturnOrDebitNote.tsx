import { useState, useRef, useEffect } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import PartyPage from "../PartyPage";

interface ReturnProduct {
  productName: string;
  ctn: number;
  pieces: number;
  quantity: number;
  price: number;
  total: number;
  refundAmount: number;
}

interface ReturnNote {
  returnNo: string;
  vendor: string;
  returnDate: string;
  products: ReturnProduct[];
  totalRefund: number;
  status: string;
}

const PurchaseReturnOrDebitNote = () => {
  const [returns, setReturns] = useState<ReturnNote[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Refs for keyboard navigation
  const returnNoRef = useRef<HTMLInputElement>(null);
  const vendorRef = useRef<HTMLInputElement>(null);
  const returnDateRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);

  const productNameRef = useRef<HTMLInputElement>(null);
  const ctnRef = useRef<HTMLInputElement>(null);
  const piecesRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const refundAmountRef = useRef<HTMLInputElement>(null);

  // Form state
  const [form, setForm] = useState<Omit<ReturnNote, "totalRefund">>({
    returnNo: "",
    vendor: "",
    returnDate: new Date().toISOString().split("T")[0],
    products: [],
    status: "Pending",
  });

  const [newProduct, setNewProduct] = useState<Omit<ReturnProduct, "total">>({
    productName: "",
    ctn: 0,
    pieces: 0,
    quantity: 0,
    price: 0,
    refundAmount: 0,
  });

  useEffect(() => {
    setNewProduct((prev) => ({
      ...prev,
      quantity: prev.ctn * prev.pieces,
    }));
  }, [newProduct.ctn, newProduct.pieces]);

  useEffect(() => {
    if (showForm) {
      returnNoRef.current?.focus();
    }
  }, [showForm]);

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

  // Add or update product in products list
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

    const existingIndex = updatedProducts.findIndex(p => p.productName === newProduct.productName);
    if (existingIndex !== -1) {
      updatedProducts[existingIndex] = { ...newProduct, total };
    } else {
      updatedProducts.push({ ...newProduct, total });
    }

    setForm({ ...form, products: updatedProducts });
    setNewProduct({
      productName: "",
      ctn: 0,
      pieces: 0,
      quantity: 0,
      price: 0,
      refundAmount: 0,
    });

    productNameRef.current?.focus();
  };

  const handleDeleteProduct = (index: number) => {
    setForm({
      ...form,
      products: form.products.filter((_, i) => i !== index),
    });
  };

  const handleSubmitReturn = () => {
    if (!form.returnNo.trim()) {
      returnNoRef.current?.focus();
      return;
    }
    if (!form.vendor.trim()) {
      vendorRef.current?.focus();
      return;
    }
    if (form.products.length === 0) {
      productNameRef.current?.focus();
      return;
    }

    const totalRefund = form.products.reduce((acc, p) => acc + p.refundAmount, 0);

    const newReturn: ReturnNote = {
      returnNo:
        editingIndex !== null
          ? returns[editingIndex].returnNo
          : `PR${(returns.length + 1).toString().padStart(3, "0")}`,
      vendor: form.vendor,
      returnDate: form.returnDate,
      products: form.products,
      totalRefund,
      status: form.status,
    };

    if (editingIndex !== null) {
      setReturns(returns.map((r, i) => (i === editingIndex ? newReturn : r)));
    } else {
      setReturns([...returns, newReturn]);
    }

    resetForm();
  };

  const resetForm = () => {
    setForm({
      returnNo: "",
      vendor: "",
      returnDate: new Date().toISOString().split("T")[0],
      products: [],
      status: "Pending",
    });
    setNewProduct({
      productName: "",
      ctn: 0,
      pieces: 0,
      quantity: 0,
      price: 0,
      refundAmount: 0,
    });
    setEditingIndex(null);
    setShowForm(false);
  };

  const handleEditReturn = (index: number) => {
    const r = returns[index];
    setForm({
      returnNo: r.returnNo,
      vendor: r.vendor,
      returnDate: r.returnDate,
      products: r.products,
      status: r.status,
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDeleteReturn = (index: number) => {
    if (window.confirm("Are you sure you want to delete this return note?")) {
      setReturns(returns.filter((_, i) => i !== index));
    }
  };

  // Filtering & search
  const filteredReturns = returns
    .filter(r => activeFilter === "All" || r.status === activeFilter)
    .filter(r =>
      r.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.returnNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const returnRows = filteredReturns.map((r, i) => ({
    id: i,
    returnNo: r.returnNo,
    vendor: r.vendor,
    returnDate: r.returnDate,
    totalRefund: r.totalRefund.toFixed(2),
    status: r.status,
  }));

  const returnColumns: GridColDef[] = [
    { field: "returnNo", headerName: "Return No", flex: 1 },
    { field: "vendor", headerName: "Vendor", flex: 1 },
    { field: "returnDate", headerName: "Return Date", flex: 1 },
    { field: "totalRefund", headerName: "Refund Amount", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "action",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <div className="space-x-2">
          <button
            className="text-blue-600 hover:underline"
            onClick={() => handleEditReturn(params.id as number)}
          >
            Edit
          </button>
          <button
            className="text-red-600 hover:underline"
            onClick={() => handleDeleteReturn(params.id as number)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <PartyPage
      title="Purchase Return / Debit Note"
      breadcrumbs={["Dashboard", "Purchase", "Return / Debit Note"]}
      buttons={[
        {
          label: showForm ? "Close Form" : "+ New Debit Note",
          variant: "primary",
          onClick: () => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          },
        },
      ]}
      filters={["All", "Approved", "Pending"]}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      customTable={
        <div className="space-y-6">
          {showForm && (
            <div className="bg-white p-6 rounded shadow border border-gray-200">
              {/* Header inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  ref={returnNoRef}
                  value={form.returnNo}
                  onChange={(e) => setForm({ ...form, returnNo: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, vendorRef, form.returnNo)}
                  placeholder="Return No"
                  className="border px-3 py-2 rounded w-full"
                />
                <input
                  ref={vendorRef}
                  value={form.vendor}
                  onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, returnDateRef, form.vendor)}
                  placeholder="Vendor Name"
                  className="border px-3 py-2 rounded w-full"
                />
                <input
                  ref={returnDateRef}
                  type="date"
                  value={form.returnDate}
                  onChange={(e) => setForm({ ...form, returnDate: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, statusRef, form.returnDate)}
                  className="border px-3 py-2 rounded w-full"
                />
              </div>

              <div className="mt-4">
                <select
                  ref={statusRef}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, productNameRef, form.status)}
                  className="border px-3 py-2 rounded w-full"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                </select>
              </div>

              {/* Product inputs */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-6 gap-3">
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
                  className="border px-3 py-2 rounded"
                  min={0}
                />
                <input
                  ref={piecesRef}
                  type="number"
                  value={newProduct.pieces}
                  onChange={(e) => setNewProduct({ ...newProduct, pieces: +e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, priceRef, newProduct.pieces)}
                  placeholder="Pieces"
                  className="border px-3 py-2 rounded"
                  min={0}
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
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: +e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, refundAmountRef, newProduct.price)}
                  placeholder="Price"
                  className="border px-3 py-2 rounded"
                  min={0}
                />
                <input
                  ref={refundAmountRef}
                  type="number"
                  value={newProduct.refundAmount}
                  onChange={(e) => setNewProduct({ ...newProduct, refundAmount: +e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddProduct();
                    }
                  }}
                  placeholder="Refund Amount"
                  className="border px-3 py-2 rounded"
                  min={0}
                />
              </div>

              <button
                onClick={handleAddProduct}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
              >
                + Add Product
              </button>

              {/* Products Table */}
              {form.products.length > 0 && (
                <table className="w-full mt-4 text-left border-t">
                  <thead>
                    <tr>
                      <th className="py-2">Product</th>
                      <th className="py-2">CTN</th>
                      <th className="py-2">Pieces</th>
                      <th className="py-2">Qty</th>
                      <th className="py-2">Price</th>
                      <th className="py-2">Refund</th>
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
                        <td className="py-1">{p.refundAmount}</td>
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
                                refundAmount: p.refundAmount,
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

              <button
                onClick={handleSubmitReturn}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded"
              >
                {editingIndex !== null ? "Update Return Note" : "Submit Return Note"}
              </button>
            </div>
          )}

          {/* DataGrid */}
          <div className="bg-white rounded border shadow">
            <DataGrid
              rows={returnRows}
              columns={returnColumns}
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

export default PurchaseReturnOrDebitNote;
