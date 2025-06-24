import { useState, useRef, useEffect } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import PartyPage from "../PartyPage";

interface CreditNoteProduct {
  productName: string;
  ctn: number;
  pieces: number;
  quantity: number;
  price: number;
  total: number;
  refundAmount: number;
}

interface CreditNote {
  creditNoteId: string;
  invoiceNo: string;
  customer: string;
  returnDate: string;
  products: CreditNoteProduct[];
  totalRefund: number;
  status: string;
}

const SalesReturnOrCreditNote = () => {
  const [notes, setNotes] = useState<CreditNote[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Refs for keyboard navigation
  const invoiceNoRef = useRef<HTMLInputElement>(null);
  const customerRef = useRef<HTMLInputElement>(null);
  const returnDateRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);

  // Product refs
  const productNameRef = useRef<HTMLInputElement>(null);
  const ctnRef = useRef<HTMLInputElement>(null);
  const piecesRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const refundAmountRef = useRef<HTMLInputElement>(null);

  // Form state for CreditNote
  const [form, setForm] = useState<Omit<CreditNote, "creditNoteId" | "totalRefund">>({
    invoiceNo: "",
    customer: "",
    returnDate: new Date().toISOString().split("T")[0],
    products: [],
    status: "Pending",
  });

  // New product state
  const [newProduct, setNewProduct] = useState<Omit<CreditNoteProduct, "total">>({
    productName: "",
    ctn: 0,
    pieces: 0,
    quantity: 0,
    price: 0,
    refundAmount: 0,
  });

  // Calculate quantity when ctn or pieces change
  useEffect(() => {
    setNewProduct((prev) => ({
      ...prev,
      quantity: prev.ctn * prev.pieces,
    }));
  }, [newProduct.ctn, newProduct.pieces]);

  // Auto-focus first input when form shows
  useEffect(() => {
    if (showForm) {
      invoiceNoRef.current?.focus();
    }
  }, [showForm]);

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

  // Add or update product in the product list
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

    // Check if editing product or adding new
    const existingProductIndex = updatedProducts.findIndex(p => p.productName === newProduct.productName);
    if (existingProductIndex !== -1) {
      updatedProducts[existingProductIndex] = { ...newProduct, total };
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

  // Remove product from products list
  const handleDeleteProduct = (index: number) => {
    setForm({
      ...form,
      products: form.products.filter((_, i) => i !== index),
    });
  };

  // Submit or update credit note
  const handleSubmitNote = () => {
    if (!form.invoiceNo.trim()) {
      invoiceNoRef.current?.focus();
      return;
    }
    if (!form.customer.trim()) {
      customerRef.current?.focus();
      return;
    }
    if (form.products.length === 0) {
      productNameRef.current?.focus();
      return;
    }

    const totalRefund = form.products.reduce((acc, p) => acc + p.refundAmount, 0);

    const newNote: CreditNote = {
      creditNoteId:
        editingIndex !== null
          ? notes[editingIndex].creditNoteId
          : `CN${(notes.length + 1).toString().padStart(3, "0")}`,
      invoiceNo: form.invoiceNo,
      customer: form.customer,
      returnDate: form.returnDate,
      products: form.products,
      totalRefund,
      status: form.status,
    };

    if (editingIndex !== null) {
      setNotes(notes.map((n, i) => (i === editingIndex ? newNote : n)));
    } else {
      setNotes([...notes, newNote]);
    }

    resetForm();
  };

  // Reset form to initial empty state
  const resetForm = () => {
    setForm({
      invoiceNo: "",
      customer: "",
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

  // Edit a note by index
  const handleEditNote = (index: number) => {
    const note = notes[index];
    setForm({
      invoiceNo: note.invoiceNo,
      customer: note.customer,
      returnDate: note.returnDate,
      products: note.products,
      status: note.status,
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  // Delete note with confirmation
  const handleDeleteNote = (index: number) => {
    if (window.confirm("Are you sure you want to delete this credit note?")) {
      setNotes(notes.filter((_, i) => i !== index));
    }
  };

  // Filter & search notes
  const filteredNotes = notes
    .filter((n) => activeFilter === "All" || n.status === activeFilter)
    .filter(
      (n) =>
        n.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.customer.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const noteRows = filteredNotes.map((n, i) => ({
    id: i,
    creditNoteId: n.creditNoteId,
    invoiceNo: n.invoiceNo,
    customer: n.customer,
    returnDate: n.returnDate,
    totalRefund: n.totalRefund.toFixed(2),
    status: n.status,
  }));

  const noteColumns: GridColDef[] = [
    { field: "creditNoteId", headerName: "Credit Note ID", flex: 1 },
    { field: "invoiceNo", headerName: "Invoice No", flex: 1 },
    { field: "customer", headerName: "Customer", flex: 1 },
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
            onClick={() => handleEditNote(params.id as number)}
          >
            Edit
          </button>
          <button
            className="text-red-600 hover:underline"
            onClick={() => handleDeleteNote(params.id as number)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <PartyPage
      title="Sales Return / Credit Note"
      breadcrumbs={["Dashboard", "Sales", "Return / Credit Note"]}
      buttons={[
        {
          label: showForm ? "Close Form" : "+ New Credit Note",
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
      filters={["All", "Processed", "Pending"]}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      customTable={
        <div className="space-y-6">
          {showForm && (
            <div className="bg-white p-6 rounded shadow border border-gray-200">
              {/* Header fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  ref={invoiceNoRef}
                  value={form.invoiceNo}
                  onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, customerRef, form.invoiceNo)}
                  placeholder="Invoice No"
                  className="border px-3 py-2 rounded w-full"
                />
                <input
                  ref={customerRef}
                  value={form.customer}
                  onChange={(e) => setForm({ ...form, customer: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, returnDateRef, form.customer)}
                  placeholder="Customer Name"
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
                  <option value="Processed">Processed</option>
                </select>
              </div>

              {/* Product input fields */}
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

              {/* Product List */}
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
                onClick={handleSubmitNote}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded"
              >
                {editingIndex !== null ? "Update Credit Note" : "Submit Credit Note"}
              </button>
            </div>
          )}

          {/* Notes table */}
          <div className="bg-white rounded border shadow">
            <DataGrid
              rows={noteRows}
              columns={noteColumns}
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

export default SalesReturnOrCreditNote;
