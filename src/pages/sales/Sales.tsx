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

interface Sale {
  invoiceNo: string;
  customer: string;
  date: string;
  products: Product[];
  total: string;
  status: string;
  paymentMethod?: string;
  notes?: string;
}

const Sales = () => {
  // State and refs
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");

  // Form refs
  const customerInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const statusSelectRef = useRef<HTMLSelectElement>(null);
  const paymentMethodRef = useRef<HTMLSelectElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const productNameRef = useRef<HTMLInputElement>(null);
  const ctnRef = useRef<HTMLInputElement>(null);
  const piecesRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);

  // Form state including date at top — this date applies for all new sales until changed by user
  const [form, setForm] = useState({
    customer: "",
    date: new Date().toISOString().split("T")[0],  // date at top to be entered once
    status: "Pending",
    paymentMethod: "Cash",
    notes: "",
    products: [] as Product[],
  });

  const [newProduct, setNewProduct] = useState<Omit<Product, "total">>({
    productName: "",
    ctn: 0,
    pieces: 0,
    quantity: 0,
    price: 0,
  });

  // Auto-focus first input when form opens
  useEffect(() => {
    if (showForm && customerInputRef.current) {
      customerInputRef.current.focus();
    }
  }, [showForm]);

  // Auto-calculate quantity when ctn or pieces changes
  useEffect(() => {
    setNewProduct(prev => ({
      ...prev,
      quantity: prev.ctn * prev.pieces,
    }));
  }, [newProduct.ctn, newProduct.pieces]);

  // Handle Enter key navigation with validation
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    nextRef?: React.RefObject<HTMLElement>,
    currentValue?: string | number,
    isOptional: boolean = false
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (
        isOptional ||
        (typeof currentValue === "string"
          ? currentValue.trim() !== ""
          : currentValue !== 0 && currentValue !== undefined && currentValue !== null)
      ) {
        nextRef?.current?.focus();
      }
    }
  };

  // Filter sales for search and active filter
  const filteredSales = sales
    .filter((sale) => {
      if (activeFilter === "Pending") return sale.status === "Pending";
      if (activeFilter === "Paid") return sale.status === "Paid";
      return true;
    })
    .filter((sale) =>
      Object.values(sale).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  // DataGrid columns
  const columns: GridColDef[] = [
    { field: "invoiceNo", headerName: "Invoice No", flex: 1 },
    { field: "customer", headerName: "Customer", flex: 1 },
    { field: "date", headerName: "Date", flex: 1 },
    { field: "total", headerName: "Total", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "action",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <div className="flex space-x-2">
          <button
            className="text-blue-600 hover:text-blue-800 hover:underline"
            onClick={() => handleEdit(params.id as number)}
          >
            Edit
          </button>
          <button
            className="text-red-600 hover:text-red-800 hover:underline"
            onClick={() => handleDelete(params.id as number)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  // Add product to form.products
  const handleAddProduct = () => {
    if (!newProduct.productName || !newProduct.price) return;

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

  // Submit or update sale, using date from form.date only once at top (applies to all sales)
  const handleSubmitSale = () => {
    if (!form.customer || form.products.length === 0) return;

    const invoiceTotal = form.products.reduce((acc, p) => acc + p.total, 0);
    const newSale: Sale = {
      invoiceNo:
        editingIndex !== null
          ? sales[editingIndex].invoiceNo
          : `INV${(sales.length + 1).toString().padStart(3, "0")}`,
      customer: form.customer,
      date: form.date, // <- date used from top input only once for all sales
      products: form.products,
      total: invoiceTotal.toFixed(2),
      status: form.status,
      paymentMethod: form.paymentMethod,
      notes: form.notes,
    };

    setSales(
      editingIndex !== null
        ? sales.map((s, i) => (i === editingIndex ? newSale : s))
        : [...sales, newSale]
    );
    resetForm();
  };

  // Reset form but keep date as is (optional: reset date to today if you want)
  const resetForm = () => {
    setForm({
      customer: "",
      date: form.date, // keep current date so user doesn't have to re-enter each time
      status: "Pending",
      paymentMethod: "Cash",
      notes: "",
      products: [],
    });
    setNewProduct({ productName: "", ctn: 0, pieces: 0, quantity: 0, price: 0 });
    setEditingIndex(null);
    setEditingProductIndex(null);
    setShowForm(false);
  };

  // Edit existing sale - loads date too
  const handleEdit = (index: number) => {
    const sale = sales[index];
    setForm({
      customer: sale.customer,
      date: sale.date,
      status: sale.status,
      paymentMethod: sale.paymentMethod || "Cash",
      notes: sale.notes || "",
      products: sale.products,
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  // Delete sale
  const handleDelete = (index: number) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      setSales(sales.filter((_, i) => i !== index));
    }
  };

  // Rows for DataGrid
  const rows = filteredSales.map((s, i) => ({ id: i, ...s }));

  return (
    <PartyPage
      title="Sales"
      breadcrumbs={["Dashboard", "Sales"]}
      buttons={[
        {
          label: showForm ? "Close Form" : "+ Add New Sale",
          variant: "primary",
          onClick: () => setShowForm(!showForm),
        },
      ]}
      filters={["All", "Paid", "Pending"]}
      searchTerm={searchTerm}
      onSearchChange={(value) => setSearchTerm(value)}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      customTable={
        <div className="space-y-6">
          {showForm && (
            <div className="space-y-4 p-6 bg-white rounded-lg shadow border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {editingIndex !== null ? "Edit Sale" : "Add New Sale"}
              </h2>

              {/* Customer Info and Date input at top, user enters date once */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name*
                  </label>
                  <input
                    ref={customerInputRef}
                    value={form.customer}
                    onChange={(e) => setForm({ ...form, customer: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, dateInputRef, form.customer)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter customer name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date*
                  </label>
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, statusSelectRef, form.date)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Status and Payment Method */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
                  <select
                    ref={statusSelectRef}
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, paymentMethodRef, form.status)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method*</label>
                  <select
                    ref={paymentMethodRef}
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, notesRef, form.paymentMethod)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  ref={notesRef}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, productNameRef, form.notes, true)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes"
                />
              </div>

              {/* Product Entry */}
              <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                <h3 className="font-semibold text-gray-800 mb-3">Add Product</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <input
                    ref={productNameRef}
                    value={newProduct.productName}
                    onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, ctnRef, newProduct.productName)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Product Name*"
                    required
                  />
                  <input
                    ref={ctnRef}
                    type="number"
                    min="0"
                    value={newProduct.ctn || ""}
                    onChange={(e) => setNewProduct({ ...newProduct, ctn: +e.target.value || 0 })}
                    onKeyDown={(e) => handleKeyDown(e, piecesRef, newProduct.ctn)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="CTN*"
                    required
                  />
                  <input
                    ref={piecesRef}
                    type="number"
                    min="0"
                    value={newProduct.pieces || ""}
                    onChange={(e) => setNewProduct({ ...newProduct, pieces: +e.target.value || 0 })}
                    onKeyDown={(e) => handleKeyDown(e, priceRef, newProduct.pieces)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Pieces/CTN*"
                    required
                  />
                  <input
                    type="number"
                    min="0"
                    value={newProduct.quantity || ""}
                    readOnly
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                    placeholder="Auto-calculated"
                  />
                  <input
                    ref={priceRef}
                    type="number"
                    min="0"
                    step="0.01"
                    value={newProduct.price || ""}
                    onChange={(e) => setNewProduct({ ...newProduct, price: +e.target.value || 0 })}
                    onKeyDown={(e) => e.key === "Enter" && handleAddProduct()}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Price*"
                    required
                  />
                  {/* Total calculated = quantity * price */}
                  <input
                    readOnly
                    value={(newProduct.quantity * newProduct.price).toFixed(2)}
                    placeholder="Total"
                    className="border px-3 py-2 rounded bg-gray-100"
                  />
                </div>
                <button
                  onClick={handleAddProduct}
                  disabled={
                    !newProduct.productName || !newProduct.price || !newProduct.ctn || !newProduct.pieces
                  }
                  className={`mt-3 px-4 py-2 rounded-md shadow ${
                    !newProduct.productName || !newProduct.price || !newProduct.ctn || !newProduct.pieces
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {editingProductIndex !== null ? "Update Product" : "+ Add Product"}
                </button>
              </div>

              {/* Products List */}
              {form.products.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CTN
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pieces/CTN
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Qty
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {form.products.map((product, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap">{product.productName}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{product.ctn}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{product.pieces}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{product.quantity}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{product.price.toFixed(2)}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{product.total.toFixed(2)}</td>
                          <td className="px-4 py-2 whitespace-nowrap space-x-2">
                            <button
                              onClick={() => {
                                const { total, ...rest } = product;
                                setNewProduct(rest);
                                setEditingProductIndex(index);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setForm({
                                  ...form,
                                  products: form.products.filter((_, i) => i !== index),
                                });
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="px-4 py-2 text-right font-medium text-gray-900">
                          Grand Total:
                        </td>
                        <td className="px-4 py-2 font-medium text-gray-900">
                          {form.products.reduce((sum, p) => sum + p.total, 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-2"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmitSale}
                disabled={!form.customer || form.products.length === 0}
                className={`px-6 py-2 rounded-md shadow ${
                  !form.customer || form.products.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } text-white font-medium`}
              >
                {editingIndex !== null ? "Update Sale" : "Submit Sale"}
              </button>
            </div>
          )}

          {/* Sales Table */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <DataGrid
              rows={rows}
              columns={columns}
              autoHeight
              pageSizeOptions={[10]}
              sx={{
                "& .MuiDataGrid-cell:focus": { outline: "none" },
                "& .MuiDataGrid-columnHeader:focus": { outline: "none" },
              }}
            />
          </div>
        </div>
      }
    />
  );
};

export default Sales;
