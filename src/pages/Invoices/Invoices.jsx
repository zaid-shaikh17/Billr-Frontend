import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import {
  fetchInvoices,
  fetchClients,
  createInvoice,
  updateInvoiceStatus,
  removeInvoice,
  sendEmail,
} from "../../services/api";
import {
  formatCurrency,
  formatDate,
  getStatusColor,
} from "../../utils/helpers";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./Invoices.css";

const emptyForm = {
  clientId: "",
  items: [{ description: "", quantity: 1, rate: 0 }],
  tax: 0,
  dueDate: "",
  notes: "",
};

const Invoices = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadData();
  }, [user]);

  const loadData = useCallback(async () => {
    try {
      const [invRes, cliRes] = await Promise.all([
        fetchInvoices(),
        fetchClients(),
      ]);
      if (invRes.data.success) setInvoices(invRes.data.invoices);
      if (cliRes.data.success) setClients(cliRes.data.clients);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] =
      field === "quantity" || field === "rate" ? Number(value) : value;
    setFormData({ ...formData, items: updated });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 1, rate: 0 }],
    });
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const getSubtotal = () =>
    formData.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const getTotal = useMemo(() => getSubtotal() + (getSubtotal() * formData.tax) / 100
  , [formData.items, formData.tax]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await createInvoice(formData);
      if (data.success) {
        setInvoices([data.invoice, ...invoices]);
        toast.success("Invoice created");
        closeModal();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = useCallback(async (id, status) => {
    try {
      const { data } = await updateInvoiceStatus(id, status);
      if (data.success) {
        setInvoices(
          invoices.map((inv) => (inv._id === id ? { ...inv, status } : inv)),
        );
        toast.success("Status updated");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  }, [invoices]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    try {
      const { data } = await removeInvoice(id);
      if (data.success) {
        setInvoices(invoices.filter((inv) => inv._id !== id));
        setShowDetail(null);
        toast.success("Invoice deleted");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  }, [invoices]);

  const closeModal = () => {
    setShowModal(false);
    setFormData(emptyForm);
  };

  const filtered = useMemo(() => 
  invoices.filter((inv) => {
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientId?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  }), [invoices, search, statusFilter]);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Invoices</h2>
          <p>Create and manage your invoices</p>
        </div>
        <button
          className="btn-primary add-btn"
          onClick={() => setShowModal(true)}
        >
          + New Invoice
        </button>
      </div>

      <div className="invoice-filters">
        <input
          type="text"
          placeholder="Search by invoice # or client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <div className="status-filters">
          {["All", "Draft", "Sent", "Paid", "Overdue"].map((s) => (
            <button
              key={s}
              className={`filter-btn ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>No invoices found.</p>
        </div>
      ) : (
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr
                key={inv._id}
                onClick={() => setShowDetail(inv)}
                className="clickable-row"
              >
                <td>{inv.invoiceNumber}</td>
                <td>{inv.clientId?.name || "N/A"}</td>
                <td>{formatCurrency(inv.total)}</td>
                <td>{formatDate(inv.dueDate)}</td>
                <td>
                  <span className={`status-badge ${inv.status.toLowerCase()}`}>
                    {inv.status}
                  </span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <select
                    className="status-select"
                    value={inv.status}
                    onChange={(e) =>
                      handleStatusChange(inv._id, e.target.value)
                    }
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent" disabled>
                      Sent
                    </option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue" disabled>
                      Overdue
                    </option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Invoice Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal invoice-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>New Invoice</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Client</label>
                <select
                  value={formData.clientId}
                  onChange={(e) =>
                    setFormData({ ...formData, clientId: e.target.value })
                  }
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} — {c.company}
                    </option>
                  ))}
                </select>
              </div>

              <div className="items-section">
                <label>Items</label>
                {formData.items.map((item, index) => (
                  <div key={index} className="item-row">
                    <input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                      required
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                      min="1"
                    />
                    <input
                      type="number"
                      placeholder="Rate (₹)"
                      value={item.rate}
                      onChange={(e) =>
                        handleItemChange(index, "rate", e.target.value)
                      }
                      min="0"
                    />
                    <span className="item-total">
                      {formatCurrency(item.quantity * item.rate)}
                    </span>
                    <button
                      type="button"
                      className="remove-item"
                      onClick={() => removeItem(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-item-btn"
                  onClick={addItem}
                >
                  + Add Item
                </button>
              </div>

              <div className="invoice-summary">
                <div className="form-group">
                  <label>Tax (%)</label>
                  <input
                    type="number"
                    value={formData.tax}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tax: Number(e.target.value),
                      })
                    }
                    min="0"
                    max="100"
                  />
                </div>
                <div className="totals">
                  <p>
                    Subtotal: <strong>{formatCurrency(getSubtotal())}</strong>
                  </p>
                  <p>
                    Tax ({formData.tax}%):{" "}
                    <strong>
                      {formatCurrency((getSubtotal() * formData.tax) / 100)}
                    </strong>
                  </p>
                  <p className="total-line">
                    Total: <strong>{formatCurrency(getTotal())}</strong>
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <input
                  placeholder="Payment terms or notes..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Create Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div
            className="modal invoice-detail"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="detail-header">
              <div>
                <h3>{showDetail.invoiceNumber}</h3>
                <span
                  className={`status-badge ${showDetail.status.toLowerCase()}`}
                >
                  {showDetail.status}
                </span>
              </div>
              <button className="close-btn" onClick={() => setShowDetail(null)}>
                ✕
              </button>
            </div>

            <div className="detail-client">
              <p>
                <strong>Client:</strong> {showDetail.clientId?.name}
              </p>
              <p>
                <strong>Email:</strong> {showDetail.clientId?.email}
              </p>
              <p>
                <strong>Due:</strong> {formatDate(showDetail.dueDate)}
              </p>
            </div>

            <table className="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {showDetail.items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.rate)}</td>
                    <td>{formatCurrency(item.quantity * item.rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="detail-totals">
              <p>
                Subtotal: <strong>{formatCurrency(showDetail.subtotal)}</strong>
              </p>
              <p>
                Tax ({showDetail.tax}%):{" "}
                <strong>
                  {formatCurrency((showDetail.subtotal * showDetail.tax) / 100)}
                </strong>
              </p>
              <p className="total-line">
                Total: <strong>{formatCurrency(showDetail.total)}</strong>
              </p>
            </div>

            {showDetail.notes && (
              <p className="detail-notes">{showDetail.notes}</p>
            )}

            <div className="modal-actions">
              <button
                className="btn-delete-inv"
                onClick={() => handleDelete(showDetail._id)}
              >
                Delete
              </button>
              <button
                className="btn-secondary"
                onClick={async () => {
                  try {
                    const { data } = await sendEmail(showDetail._id);
                    if (data.success) {
                      toast.success("Invoice sent to client!");
                      setInvoices(
                        invoices.map((inv) =>
                          inv._id === showDetail._id
                            ? { ...inv, status: "Sent" }
                            : inv,
                        ),
                      );
                      setShowDetail({ ...showDetail, status: "Sent" });
                    } else {
                      toast.error(data.message);
                    }
                  } catch (error) {
                    toast.error("Failed to send email");
                  }
                }}
              >
                Send Email
              </button>
              <button
                className="btn-primary"
                style={{ width: "auto", padding: "0.6rem 1.2rem" }}
                onClick={() => {
                  const token = localStorage.getItem("token");
                  fetch(
                    `${import.meta.env.VITE_API_URL}/api/pdf/${showDetail._id}`,
                    {
                      headers: { Authorization: `Bearer ${token}` },
                    },
                  )
                    .then((res) => res.blob())
                    .then((blob) => {
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${showDetail.invoiceNumber}.pdf`;
                      a.click();
                      URL.revokeObjectURL(url);
                    })
                    .catch(() => toast.error("Failed to download PDF"));
                }}
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Invoices;
