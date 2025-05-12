import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PublicOnlyRoute({ children }) {
  const { user } = useAuth();

  return user ? <Navigate to="/me" /> : children;
}

export default PublicOnlyRoute;
