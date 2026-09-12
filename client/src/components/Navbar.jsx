import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import NotificationBell from "./NotificationBell.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <Link to="/" className="brand">
        <span className="brand-mark">हाम्रो उत्पादन</span>
        <span className="brand-sub">Hamro Utpadan</span>
      </Link>
      {user && (
        <div className="topbar-right">
          <span className="role-pill">{user.name} · {user.role}</span>
          <NotificationBell />
          <button className="logout-link" onClick={logout}>Log out</button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
