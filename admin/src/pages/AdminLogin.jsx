
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [activeImage, setActiveImage] = useState(0);

  const images = [
    "/cart.webp",
    "/sell.jpg",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(
        form.username.trim(),
        form.password
      );

      navigate("/");
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

          <span className="brand-mark">
            हाम्रो उत्पादन
          </span>

          <p className="login-tagline">
            Admin console. Restricted access — this is
            where farmer and supplier logins are issued.
          </p>

          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="field">
              <label htmlFor="username">
                Username
              </label>

              <input
                id="username"
                type="text"
                value={form.username}
                onChange={(e) =>
                  setForm({
                    ...form,
                    username: e.target.value,
                  })
                }
                required
                autoComplete="username"
              />
            </div>

            <div className="field">
  <label htmlFor="password">
    Password
  </label>

  <div className="password-wrapper">
    <input
      id="password"
      type={showPassword ? "text" : "password"}
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

    <button
      type="button"
      className="password-toggle"
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? "👁️" : "👁️"}
    </button>
  </div>
</div>

            
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>

          </form>
        </div>
      </div>


    
      <div
        className="login-image-side"
        aria-hidden="true"
      >

      
        <img
          src="/veggie-bg.svg"
          alt=""
          className="login-veggie-bg"
        />

       
        <img
          key={activeImage}
          src={images[activeImage]}
          alt=""
          className="admin-login-image"
        />

       
        <div className="image-indicators">

          {images.map((_, index) => (
            <span
              key={index}
              className={`image-dot ${
                activeImage === index
                  ? "active"
                  : ""
              }`}
            />
          ))}

        </div>

      </div>

    </div>
  );
};

export default AdminLogin;

