import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(
        form.username.trim(),
        form.password
      );

    
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "farmer") {
        navigate("/farmer");
      } else if (user.role === "supplier") {
        navigate("/supplier");
      } else {
        setError("Invalid user role");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen login-split">
      <div className="login-form-side">
        <div className="login-card">
          <span className="brand-mark">हाम्रो उत्पादन</span>

          <p className="login-tagline">
            Sign in as a Farmer or Supplier.
          </p>

          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="username">Username</label>

              <input
                id="username"
                value={form.username}
                onChange={(e) =>
                  setForm({
                    ...form,
                    username: e.target.value,
                  })
                }
                autoComplete="username"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                autoComplete="current-password"
                required
              />
            </div>

            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>

      <div className="login-image-side" aria-hidden="true">
        <img src="/veggie-bg.svg" alt="" />
      </div>
    </div>
  );
};

export default Login;
