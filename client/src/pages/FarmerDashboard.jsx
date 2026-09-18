import { useEffect, useState } from "react";
import api from "../api/axios.js";
import CameraCapture from "../components/CameraCapture.jsx";
import AnalyticsPanel from "../components/AnalyticsPanel.jsx";

const emptyForm = { name: "", category: "vegetable", quantity: "", unit: "kg", pricePerUnit: "", notes: "" };

const statusLabel = { available: "Available", low_stock: "Low stock", out_of_stock: "Out of stock" };

const orderStatusLabel = {
  pending: "Waiting for your confirmation",
  confirmed: "Confirmed - ready to dispatch",
  dispatched: "On the way to the supplier",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "-";

const FarmerDashboard = () => {
  const [tab, setTab] = useState("listings");

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

 
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [dispatchDraft, setDispatchDraft] = useState({}); // { [orderId]: { deliveryPartnerName, photo } }
  const [openDispatchId, setOpenDispatchId] = useState(null);

  const load = async () => {
    const { data } = await api.get("/products");
    setProducts(data.products);
    setLoading(false);
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    const { data } = await api.get("/orders");
    setOrders(data.orders);
    setOrdersLoading(false);
  };

  useEffect(() => { load(); loadOrders(); }, []);

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

 
  const confirmOrder = async (id) => {
    await api.patch(`/orders/${id}/confirm`);
    loadOrders();
  };

  const updateDraft = (id, patch) => {
    setDispatchDraft((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const submitDispatch = async (id) => {
    const draft = dispatchDraft[id] || {};
    if (!draft.deliveryPartnerName?.trim()) {
      window.alert("Enter the delivery partner name before dispatching.");
      return;
    }
    await api.patch(`/orders/${id}/dispatch`, {
      deliveryPartnerName: draft.deliveryPartnerName.trim(),
      photo: draft.photo || null,
    });
    setOpenDispatchId(null);
    setDispatchDraft((prev) => ({ ...prev, [id]: undefined }));
    loadOrders();
    load();
  };

  return (
    <div className="page dashboard-bg">
      <div className="page-header">
        <div>
          <h1>Your harvest</h1>
          <p>List what you have, confirm incoming orders, and track every delivery from your field to the supplier.</p>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === "listings" ? "active" : ""}`} onClick={() => setTab("listings")}>Listings</button>
        <button className={`tab-btn ${tab === "orders" ? "active" : ""}`} onClick={() => setTab("orders")}>
          Orders {orders.filter((o) => o.status === "pending" || o.status === "confirmed").length > 0 && (
            <span className="tab-count">{orders.filter((o) => o.status === "pending" || o.status === "confirmed").length}</span>
          )}
        </button>
        <button className={`tab-btn ${tab === "analytics" ? "active" : ""}`} onClick={() => setTab("analytics")}>Revenue & demand</button>
      </div>

      {tab === "listings" && (
        <>
          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="panel-card">
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
        </>
      )}

      {tab === "orders" && (
        ordersLoading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders yet</h3>
            <p>When a supplier orders one of your listings, it will show up here for you to confirm and dispatch.</p>
          </div>
        ) : (
          <div className="order-list">
            {orders.map((o) => (
              <div className="order-card" key={o._id}>
                <div className="order-card-top">
                  <div>
                    <div className="produce-name">{o.productName}</div>
                    <div className="produce-meta">
                      {o.quantity} {o.unit} · Rs. {o.pricePerUnit}/{o.unit} · Total Rs. {o.totalAmount}
                    </div>
                    <div className="produce-meta">To: {o.supplier?.name}{o.supplier?.location ? ` · ${o.supplier.location}` : ""}</div>
                  </div>
                  <span className={`status-pill order-status-${o.status}`}>{orderStatusLabel[o.status]}</span>
                </div>

                {o.status === "pending" && (
                  <div className="order-card-actions">
                    <button className="btn btn-primary" onClick={() => confirmOrder(o._id)}>Confirm order</button>
                  </div>
                )}

                {o.status === "confirmed" && (
                  openDispatchId === o._id ? (
                    <div className="dispatch-form">
                      <div className="field">
                        <label>Delivery partner name</label>
                        <input
                          value={dispatchDraft[o._id]?.deliveryPartnerName || ""}
                          onChange={(e) => updateDraft(o._id, { deliveryPartnerName: e.target.value })}
                          placeholder="e.g. Pathao, local rider name..."
                        />
                      </div>
                      <CameraCapture
                        label="Photo before departure"
                        value={dispatchDraft[o._id]?.photo}
                        onCapture={(photo) => updateDraft(o._id, { photo })}
                      />
                      <div className="order-card-actions">
                        <button className="btn btn-primary" onClick={() => submitDispatch(o._id)}>Mark as dispatched</button>
                        <button className="btn btn-outline" onClick={() => setOpenDispatchId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="order-card-actions">
                      <button className="btn btn-primary" onClick={() => setOpenDispatchId(o._id)}>Dispatch order</button>
                    </div>
                  )
                )}

                {o.status === "dispatched" && (
                  <div className="order-trail">
                    <p><strong>Delivery partner:</strong> {o.deliveryPartnerName}</p>
                    <p><strong>Left the farm:</strong> {fmtDate(o.departureAt)}</p>
                    {o.departurePhoto && <img className="order-photo" src={o.departurePhoto} alt="Departure" />}
                    <p className="produce-meta">Waiting for the supplier to confirm it has arrived.</p>
                  </div>
                )}

                {o.status === "delivered" && (
                  <div className="order-trail">
                    <p><strong>Delivery partner:</strong> {o.deliveryPartnerName || "-"}</p>
                    <p><strong>Received by supplier:</strong> {fmtDate(o.receivedAt)}</p>
                    {o.receivedNote && <p className="produce-meta">Note: {o.receivedNote}</p>}
                    <div className="order-photo-row">
                      {o.departurePhoto && <img className="order-photo" src={o.departurePhoto} alt="Departure" />}
                      {o.arrivalPhoto && <img className="order-photo" src={o.arrivalPhoto} alt="Arrival" />}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {tab === "analytics" && <AnalyticsPanel role="farmer" />}
    </div>
  );
};

export default FarmerDashboard;
