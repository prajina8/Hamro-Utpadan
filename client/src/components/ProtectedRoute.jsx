import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";



const ProtectedRoute = ({ role, children }) => {
  const { user, ready } = useAuth();

  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
