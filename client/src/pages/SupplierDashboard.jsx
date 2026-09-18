import { useEffect, useState } from "react";
import api from "../api/axios.js";
import CameraCapture from "../components/CameraCapture.jsx";
import AnalyticsPanel from "../components/AnalyticsPanel.jsx";

const statusLabel = { available: "Available", low_stock: "Low stock", out_of_stock: "Out of stock" };

const orderStatusLabel = {
  pending: "Waiting for farmer to confirm",
  confirmed: "Farmer is preparing dispatch",
  dispatched: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "-";

const SupplierDashboard = () => {
  const [tab, setTab] = useState("board");

 
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [orderDraft, setOrderDraft] = useState({}); // { [productId]: { quantity, note } }
  const [openOrderId, setOpenOrderId] = useState(null);
  const [orderMsg, setOrderMsg] = useState("");

  
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [receiveDraft, setReceiveDraft] = useState({});
  const [openReceiveId, setOpenReceiveId] = useState(null);

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

  const updateOrderDraft = (id, patch) => setOrderDraft((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const placeOrder = async (product) => {
    const draft = orderDraft[product._id] || {};
    const quantity = Number(draft.quantity);
    if (!quantity || quantity <= 0) {
      window.alert("Enter a valid quantity to order.");
      return;
    }
    await api.post("/orders", { productId: product._id, quantity, note: draft.note || "" });
    setOpenOrderId(null);
    setOrderDraft((prev) => ({ ...prev, [product._id]: undefined }));
    setOrderMsg(`Order placed for ${quantity} ${product.unit} of ${product.name}.`);
    setTimeout(() => setOrderMsg(""), 4000);
    load();
    loadOrders();
  };

  const updateReceiveDraft = (id, patch) => setReceiveDraft((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const submitReceive = async (id) => {
    const draft = receiveDraft[id] || {};
    await api.patch(`/orders/${id}/receive`, { photo: draft.photo || null, note: draft.note || "" });
    setOpenReceiveId(null);
    setReceiveDraft((prev) => ({ ...prev, [id]: undefined }));
    loadOrders();
  };

  const visible = products.filter((p) => (filter === "" ? true : p.category === filter));

  return (
    <div className="page dashboard-bg">
      <div className="page-header">
        <div>
          <h1>Produce board</h1>
          <p>Order directly from local farmers and track every shipment until it lands in your hands.</p>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === "board" ? "active" : ""}`} onClick={() => setTab("board")}>Produce board</button>
        <button className={`tab-btn ${tab === "orders" ? "active" : ""}`} onClick={() => setTab("orders")}>
          My orders {orders.filter((o) => o.status === "dispatched").length > 0 && (
            <span className="tab-count">{orders.filter((o) => o.status === "dispatched").length}</span>
          )}
        </button>
        <button className={`tab-btn ${tab === "analytics" ? "active" : ""}`} onClick={() => setTab("analytics")}>Spend & demand</button>
      </div>

      {tab === "board" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--paper-line)", background: "var(--cream)" }}>
              <option value="">All categories</option>
              <option value="vegetable">Vegetable</option>
              <option value="fruit">Fruit</option>
              <option value="grain">Grain</option>
              <option value="dairy">Dairy</option>
              <option value="other">Other</option>
            </select>
          </div>

          {orderMsg && <div className="success-banner">{orderMsg}</div>}

          {loading ? (
            <p>Loading the board...</p>
          ) : visible.length === 0 ? (
            <div className="empty-state">
              <h3>No listings match yet</h3>
              <p>Check back soon, or try a different category.</p>
            </div>
          ) : (
            <div className="order-list">
              {visible.map((p) => (
                <div className="order-card" key={p._id}>
                  <div className="order-card-top">
                    <div>
                      <div className="produce-name">{p.name}</div>
                      <div className="produce-meta">{p.category}{p.pricePerUnit ? ` · Rs. ${p.pricePerUnit}/${p.unit}` : ""}</div>
                      <div className="produce-meta">{p.farmer?.name}{p.farmer?.location ? ` · ${p.farmer.location}` : ""}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <span className={`status-pill status-${p.status}`}>{statusLabel[p.status]}</span>
                      <span className="qty">{p.quantity} {p.unit} available</span>
                    </div>
                  </div>

                  {openOrderId === p._id ? (
                    <div className="dispatch-form">
                      <div className="form-row">
                        <div className="field">
                          <label>Quantity ({p.unit})</label>
                          <input type="number" min="0" step="0.1" value={orderDraft[p._id]?.quantity || ""} onChange={(e) => updateOrderDraft(p._id, { quantity: e.target.value })} />
                        </div>
                        <div className="field">
                          <label>Note (optional)</label>
                          <input value={orderDraft[p._id]?.note || ""} onChange={(e) => updateOrderDraft(p._id, { note: e.target.value })} placeholder="Delivery preference, packaging..." />
                        </div>
                      </div>
                      <div className="order-card-actions">
                        <button className="btn btn-primary" onClick={() => placeOrder(p)}>Place order</button>
                        <button className="btn btn-outline" onClick={() => setOpenOrderId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="order-card-actions">
                      <button className="btn btn-primary" disabled={p.status === "out_of_stock"} onClick={() => setOpenOrderId(p._id)}>
                        {p.status === "out_of_stock" ? "Out of stock" : "Order"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "orders" && (
        ordersLoading ? (
          <p>Loading your orders...</p>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders yet</h3>
            <p>Place an order from the produce board and track it here.</p>
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
                    <div className="produce-meta">From: {o.farmer?.name}{o.farmer?.location ? ` · ${o.farmer.location}` : ""}</div>
                  </div>
                  <span className={`status-pill order-status-${o.status}`}>{orderStatusLabel[o.status]}</span>
                </div>

                {(o.status === "pending" || o.status === "confirmed") && (
                  <p className="produce-meta">You'll be notified as soon as it's on the way.</p>
                )}

                {o.status === "dispatched" && (
                  openReceiveId === o._id ? (
                    <div className="dispatch-form">
                      <p><strong>Delivery partner:</strong> {o.deliveryPartnerName}</p>
                      <p><strong>Left the farm:</strong> {fmtDate(o.departureAt)}</p>
                      {o.departurePhoto && <img className="order-photo" src={o.departurePhoto} alt="Departure" />}
                      <CameraCapture
                        label="Photo on arrival"
                        value={receiveDraft[o._id]?.photo}
                        onCapture={(photo) => updateReceiveDraft(o._id, { photo })}
                      />
                      <div className="field">
                        <label>Note (optional)</label>
                        <input value={receiveDraft[o._id]?.note || ""} onChange={(e) => updateReceiveDraft(o._id, { note: e.target.value })} placeholder="Condition on arrival, quantity check..." />
                      </div>
                      <div className="order-card-actions">
                        <button className="btn btn-primary" onClick={() => submitReceive(o._id)}>Mark as received</button>
                        <button className="btn btn-outline" onClick={() => setOpenReceiveId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="order-trail">
                      <p><strong>Delivery partner:</strong> {o.deliveryPartnerName}</p>
                      <p><strong>Left the farm:</strong> {fmtDate(o.departureAt)}</p>
                      {o.departurePhoto && <img className="order-photo" src={o.departurePhoto} alt="Departure" />}
                      <div className="order-card-actions">
                        <button className="btn btn-primary" onClick={() => setOpenReceiveId(o._id)}>Mark as received</button>
                      </div>
                    </div>
                  )
                )}

                {o.status === "delivered" && (
                  <div className="order-trail">
                    <p><strong>Received:</strong> {fmtDate(o.receivedAt)}</p>
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

      {tab === "analytics" && <AnalyticsPanel role="supplier" />}
    </div>
  );
};

export default SupplierDashboard;
