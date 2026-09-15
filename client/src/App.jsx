import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import FarmerDashboard from "./pages/FarmerDashboard.jsx";
import SupplierDashboard from "./pages/SupplierDashboard.jsx";
import NotFound from "./pages/NotFound.jsx";




const Home = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
 if (user.role === "admin") {
  return <Navigate to="/admin" replace />;
}

if (user.role === "farmer") {
  return <Navigate to="/farmer" replace />;
}

return <Navigate to="/supplier" replace />;
};

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/farmer"
          element={
            <ProtectedRoute role="farmer">
              <FarmerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier"
          element={
            <ProtectedRoute role="supplier">
              <SupplierDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
