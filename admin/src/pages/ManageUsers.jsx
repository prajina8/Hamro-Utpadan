import { useEffect, useState } from "react";
import api from "../api/axios.js";

const emptyForm = { name: "", username: "", role: "farmer", phone: "", location: "", password: "" };

const ManageUsers = () => {
  const [tab, setTab] = useState("farmer");
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [issued, setIssued] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async (role) => {
    setLoading(true);
    const { data } = await api.get(`/admin/users?role=${role}`);
    setUsers(data.users);
    setLoading(false);
  };

  useEffect(() => { load(tab); }, [tab]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setIssued(null);
    try {
      const { data } = await api.post("/admin/users", { ...form, role: tab });
      setIssued({ username: data.user.username, password: data.generatedPassword, name: data.user.name });
      setForm({ ...emptyForm, role: tab });
      load(tab);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create this account");
    }
  };

  const toggleStatus = async (user) => {
    await api.patch(`/admin/users/${user.id}/status`, { isActive: !user.isActive });
    load(tab);
  };

  const resetPassword = async (user) => {
    if (!window.confirm(`Generate a new password for ${user.name}?`)) return;
    const { data } = await api.patch(`/admin/users/${user.id}/reset-password`);
    setIssued({ username: data.user.username, password: data.generatedPassword, name: data.user.name });
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p>Create and manage the only logins that exist for farmers and suppliers.</p>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === "farmer" ? "active" : ""}`} onClick={() => setTab("farmer")}>Farmers</button>
        <button className={`tab-btn ${tab === "supplier" ? "active" : ""}`} onClick={() => setTab("supplier")}>Suppliers</button>
      </div>

      {issued && (
        <div className="credential-box">
          <h4>Account created for {issued.name}</h4>
          <div className="credential-row">
            <span>Username: <strong>{issued.username}</strong></span>
            <span>Password: <strong>{issued.password}</strong></span>
          </div>
          <p className="credential-note">Share this with them now - it will not be shown again. They can log in at the farmer/supplier portal.</p>
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleCreate} style={{ background: "var(--cream-deep)", border: "1px solid var(--paper-line)", borderRadius: 10, padding: 20, marginBottom: 28 }}>
        <h3 style={{ marginBottom: 14, fontSize: "1.05rem" }}>Add a new {tab}</h3>
        <div className="form-row">
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input id="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="phone">Phone (optional)</label>
            <input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="location">Location (optional)</label>
            <input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
        </div>
        <div className="field" style={{ maxWidth: 320 }}>
          <label htmlFor="password">Password (optional - auto-generated if blank)</label>
          <input id="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Leave blank to auto-generate" />
        </div>
        <button className="btn btn-primary" type="submit">Create {tab} account</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <h3>No {tab}s yet</h3>
          <p>Use the form above to create the first account.</p>
        </div>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Contact</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td className="figure">{u.username}</td>
                <td>{u.phone || "-"}{u.location ? ` · ${u.location}` : ""}</td>
                <td>
                  <span className={`badge-role ${u.isActive ? "" : "badge-inactive"}`}>
                    {u.isActive ? "Active" : "Disabled"}
                  </span>
                </td>
                <td style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-quiet" style={{ padding: "5px 10px" }} onClick={() => resetPassword(u)}>Reset password</button>
                  <button className="btn btn-outline" style={{ padding: "5px 10px" }} onClick={() => toggleStatus(u)}>
                    {u.isActive ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageUsers;
