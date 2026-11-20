import { Navigate, useLocation } from "react-router-dom";
import { useAuth, dashboardPath } from "../context/AuthContext";

export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user)
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname, msg: "Please login to continue" }}
        replace
      />
    );
  if (roles && !roles.includes(user.role))
    return <Navigate to={dashboardPath(user.role)} replace />;
  return children;
}
