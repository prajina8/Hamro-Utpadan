import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

const Dashboard = () => {
  const [counts, setCounts] = useState({ farmer: 0, supplier: 0, products: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [farmers, suppliers, products] = await Promise.all([
        api.get("/admin/users?role=farmer"),
        api.get("/admin/users?role=supplier"),
        api.get("/products"),
      ]);
      setCounts({
        farmer: farmers.data.users.length,
        supplier: suppliers.data.users.length,
        products: products.data.products.length,
      });
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Overview</h1>
          <p>A quick look at who is registered and what is listed across the marketplace.</p>
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
      </div>

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
