import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

const money = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const Dashboard = () => {
  const [counts, setCounts] = useState({ farmer: 0, supplier: 0, products: 0 });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [farmers, suppliers, products, orderAnalytics] = await Promise.all([
        api.get("/admin/users?role=farmer"),
        api.get("/admin/users?role=supplier"),
        api.get("/products"),
        api.get("/orders/analytics"),
      ]);
      setCounts({
        farmer: farmers.data.users.length,
        supplier: suppliers.data.users.length,
        products: products.data.products.length,
      });
      setAnalytics(orderAnalytics.data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="page dashboard-bg">
      <div className="page-header">
        <div>
          <h1>Overview</h1>
          <p>A quick look at who is registered, what is listed, and how produce is moving across the marketplace.</p>
        </div>
        <Link to="/users" className="btn btn-primary">Manage users</Link>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-value">{loading ? "..." : counts.farmer}</div>
          <div className="stat-label">Farmer accounts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{loading ? "..." : counts.supplier}</div>
          <div className="stat-label">Supplier accounts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{loading ? "..." : counts.products}</div>
          <div className="stat-label">Active listings</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{loading || !analytics ? "..." : money(analytics.totalRevenue)}</div>
          <div className="stat-label">Total transacted (delivered orders)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{loading || !analytics ? "..." : analytics.totalOrders}</div>
          <div className="stat-label">Orders delivered</div>
        </div>
      </div>

      {analytics && analytics.mostDemanded.length > 0 && (
        <div className="empty-state" style={{ textAlign: "left", marginBottom: 28 }}>
          <h3 style={{ marginBottom: 8 }}>Highest demand across the marketplace</h3>
          <p style={{ margin: 0 }}>
            {analytics.mostDemanded.map((p) => `${p.name} (${p.totalQuantity} ${p.unit})`).join(" · ")}
          </p>
        </div>
      )}

      <div className="empty-state" style={{ textAlign: "left" }}>
        <h3 style={{ marginBottom: 8 }}>How access works</h3>
        <p style={{ margin: 0 }}>
          Farmers and suppliers never sign themselves up. Every login is created here in the
          admin console, so only people you have personally vetted ever get a username and
          password for the marketplace.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
