import { useEffect, useState } from "react";
import api from "../api/axios.js";

const emptyForm = { name: "", category: "vegetable", quantity: "", unit: "kg", pricePerUnit: "", notes: "" };

const statusLabel = { available: "Available", low_stock: "Low stock", out_of_stock: "Out of stock" };

const FarmerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await api.get("/products");
    setProducts(data.products);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      quantity: Number(form.quantity),
      pricePerUnit: form.pricePerUnit ? Number(form.pricePerUnit) : 0,
    };
    try {
      if (editingId) {
        await api.patch(`/products/${editingId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save this listing");
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      category: p.category,
      quantity: p.quantity,
      unit: p.unit,
      pricePerUnit: p.pricePerUnit || "",
      notes: p.notes || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this listing?")) return;
    await api.delete(`/products/${id}`);
    load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Your harvest</h1>
          <p>List what you have and how much - suppliers are notified the moment you add or update a quantity.</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit} style={{ background: "var(--cream-deep)", border: "1px solid var(--paper-line)", borderRadius: "10px", padding: "20px", marginBottom: "28px" }}>
        <h3 style={{ marginBottom: 14, fontSize: "1.1rem" }}>{editingId ? "Update listing" : "Add a product"}</h3>
        <div className="form-row">
          <div className="field">
            <label htmlFor="name">Product name</label>
            <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tomato, Maize, Milk..." required />
          </div>
          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="vegetable">Vegetable</option>
              <option value="fruit">Fruit</option>
              <option value="grain">Grain</option>
              <option value="dairy">Dairy</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="quantity">Quantity</label>
            <input id="quantity" type="number" min="0" step="0.1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
          </div>
          <div className="field">
            <label htmlFor="unit">Unit</label>
            <select id="unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="litre">litre</option>
              <option value="dozen">dozen</option>
              <option value="piece">piece</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="price">Price per unit (Rs.)</label>
            <input id="price" type="number" min="0" step="0.01" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea id="notes" rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Freshly harvested, organic, pickup only..." />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-primary" type="submit">{editingId ? "Save changes" : "Add product"}</button>
          {editingId && <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      {loading ? (
        <p>Loading your listings...</p>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h3>No listings yet</h3>
          <p>Add your first product above so suppliers can see it.</p>
        </div>
      ) : (
        <div className="ledger">
          <div className="ledger-head">
            <span>Product</span>
            <span>Quantity</span>
            <span>Price</span>
            <span>Status</span>
            <span></span>
          </div>
          {products.map((p) => (
            <div className="ledger-row" key={p._id}>
              <div>
                <div className="produce-name">{p.name}</div>
                <div className="produce-meta">{p.category}{p.notes ? ` · ${p.notes}` : ""}</div>
              </div>
              <div className="qty">{p.quantity} {p.unit}</div>
              <div className="figure">{p.pricePerUnit ? `Rs. ${p.pricePerUnit}` : "-"}</div>
              <div>
                <span className={`status-pill status-${p.status}`}>{statusLabel[p.status]}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-outline" style={{ padding: "6px 12px" }} onClick={() => handleEdit(p)}>Edit</button>
                <button className="btn btn-danger" style={{ padding: "6px 12px" }} onClick={() => handleDelete(p._id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;
