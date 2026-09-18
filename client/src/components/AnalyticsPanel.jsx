import { useEffect, useState } from "react";
import api from "../api/axios.js";

const money = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const fmtDate = (d) =>
  d ? new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "-";


const AnalyticsPanel = ({ role }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/orders/analytics");
      setData(data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <p>Crunching the numbers...</p>;
  if (!data) return null;

  const revenueLabel = role === "farmer" ? "Total revenue (delivered orders)" : "Total spend (delivered orders)";
  const pipeline = data.pipelineCounts || {};

  return (
    <div>
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-value figure">{money(data.totalRevenue)}</div>
          <div className="stat-label">{revenueLabel}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value figure">{data.totalOrders}</div>
          <div className="stat-label">Completed orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-value figure">{pipeline.pending || 0}</div>
          <div className="stat-label">Awaiting confirmation</div>
        </div>
        <div className="stat-card">
          <div className="stat-value figure">{pipeline.dispatched || 0}</div>
          <div className="stat-label">In transit</div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Highest demand</h3>
          <p className="analytics-sub">Ranked by total quantity ordered</p>
          {data.mostDemanded.length === 0 ? (
            <p className="produce-meta">No delivered orders yet.</p>
          ) : (
            <ol className="rank-list">
              {data.mostDemanded.map((p) => (
                <li key={p.name}>
                  <span className="produce-name">{p.name}</span>
                  <span className="qty">{p.totalQuantity} {p.unit}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="analytics-card">
          <h3>Most {role === "farmer" ? "profitable" : "purchased"}</h3>
          <p className="analytics-sub">Ranked by total amount ({role === "farmer" ? "earned" : "spent"})</p>
          {data.mostProfitable.length === 0 ? (
            <p className="produce-meta">No delivered orders yet.</p>
          ) : (
            <ol className="rank-list">
              {data.mostProfitable.map((p) => (
                <li key={p.name}>
                  <span className="produce-name">{p.name}</span>
                  <span className="figure">{money(p.totalAmount)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <h3 style={{ marginTop: 28, marginBottom: 12 }}>Recent transactions</h3>
      {data.recentTransactions.length === 0 ? (
        <div className="empty-state">
          <h3>Nothing delivered yet</h3>
          <p>Once orders are marked as received, they will show up here with price and amount.</p>
        </div>
      ) : (
        <div className="ledger">
          <div className="ledger-head">
            <span>Product</span>
            <span>Quantity</span>
            <span>Price/unit</span>
            <span>Amount</span>
            <span>Delivered</span>
          </div>
          {data.recentTransactions.map((t) => (
            <div className="ledger-row" key={t.id}>
              <div className="produce-name">{t.productName}</div>
              <div className="qty">{t.quantity} {t.unit}</div>
              <div className="figure">{money(t.pricePerUnit)}</div>
              <div className="figure">{money(t.totalAmount)}</div>
              <div className="produce-meta">{fmtDate(t.receivedAt)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalyticsPanel;
