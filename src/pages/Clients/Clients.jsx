import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import {
  createClient,
  updateClient,
  removeClient,
} from "../../services/api";
import "./Clients.css";

const emptyForm = { name: "", email: "", phone: "", company: "", notes: "" };

const Clients = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { clients, setClients, loadClients, loadingClients } = useData()
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

useEffect(() => {
  if (!user) return
  loadClients()
}, [user])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingClient) {
        const { data } = await updateClient(editingClient._id, formData);
        if (data.success) {
          setClients(
            clients.map((c) => (c._id === editingClient._id ? data.client : c)),
          );
          toast.success("Client updated");
        }
      } else {
        const { data } = await createClient(formData);
        if (data.success) {
          setClients([data.client, ...clients]);
          toast.success("Client added");
        }
      }
      closeModal();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      notes: client.notes,
    });
    setShowModal(true);
  };

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Delete this client?")) return;
    try {
      const { data } = await removeClient(id);
      if (data.success) {
        setClients(clients.filter((c) => c._id !== id));
        toast.success("Client deleted");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  }, [clients]);

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setFormData(emptyForm);
  };

const filtered = useMemo(() =>
  (clients || []).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase())
  )
, [clients, search])

if (loadingClients || !clients) return <div className='loading'>Loading...</div>

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Clients</h2>
          <p>Manage your client list</p>
        </div>
        <button
          className="btn-primary add-btn"
          onClick={() => setShowModal(true)}
        >
          + Add Client
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, email or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>No clients found.</p>
        </div>
      ) : (
        <div className="clients-grid">
          {filtered.map((client) => (
            <div key={client._id} className="client-card">
              <div className="client-top" onClick={() => navigate(`/clients/${client._id}`)} style={{ cursor: "pointer" }}>
                <div className="client-avatar">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="client-info">
                  <h4>{client.name}</h4>
                  <p>{client.email}</p>
                  {client.company && (
                    <p className="company">{client.company}</p>
                  )}
                  {client.phone && <p>{client.phone}</p>}
                  {client.notes && <p className="notes">{client.notes}</p>}
                </div>
              </div>
              <div className="client-actions">
                <button className="btn-edit" onClick={() => handleEdit(client)}>
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(client._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingClient ? "Edit Client" : "Add Client"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Full name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="email@example.com"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Company name"
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any notes..."
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
                  {submitting
                    ? "Saving..."
                    : editingClient
                      ? "Update"
                      : "Add Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Clients;
