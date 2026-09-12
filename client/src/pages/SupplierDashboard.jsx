import { useEffect, useState } from "react";
import api from "../api/axios.js";

const statusLabel = { available: "Available", low_stock: "Low stock", out_of_stock: "Out of stock" };

const SupplierDashboard = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [requestedIds, setRequestedIds] = useState([]);

  const load = async () => {
    const { data } = await api.get("/products");
    setProducts(data.products);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const requestRestock = async (id) => {
    await api.post(`/products/${id}/request-restock`);
    setRequestedIds((prev) => [...prev, id]);
  };

  const visible = products.filter((p) =>
    filter === "" ? true : p.category === filter
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Produce board</h1>
          <p>Everything local farmers currently have listed. Low and out-of-stock items are flagged automatically - request a restock straight from here.</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--paper-line)", background: "var(--cream)" }}>
          <option value="">All categories</option>
          <option value="vegetable">Vegetable</option>
          <option value="fruit">Fruit</option>
          <option value="grain">Grain</option>
          <option value="dairy">Dairy</option>
          <option value="other">Other</option>
        </select>
      </div>

      {loading ? (
        <p>Loading the board...</p>
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <h3>No listings match yet</h3>
          <p>Check back soon, or try a different category.</p>
        </div>
      ) : (
        <div className="ledger">
          <div className="ledger-head">
            <span>Product</span>
            <span>Farmer</span>
            <span>Quantity</span>
            <span>Status</span>
            <span></span>
          </div>
          {visible.map((p) => (
            <div className="ledger-row" key={p._id}>
              <div>
                <div className="produce-name">{p.name}</div>
                <div className="produce-meta">{p.category}{p.pricePerUnit ? ` · Rs. ${p.pricePerUnit}/${p.unit}` : ""}</div>
              </div>
              <div className="produce-meta">{p.farmer?.name}{p.farmer?.location ? ` · ${p.farmer.location}` : ""}</div>
              <div className="qty">{p.quantity} {p.unit}</div>
              <div>
                <span className={`status-pill status-${p.status}`}>{statusLabel[p.status]}</span>
              </div>
              <div>
                <button
                  className="btn btn-outline"
                  style={{ padding: "6px 12px" }}
                  disabled={requestedIds.includes(p._id)}
                  onClick={() => requestRestock(p._id)}
                >
                  {requestedIds.includes(p._id) ? "Requested" : "Request restock"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupplierDashboard;
