import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Logout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    logout(); // ← met à jour le contexte global
    navigate("/login"); // ← redirection après logout
  }, [logout, navigate]);

  return (
    <div className="container text-center mt-5">
      <h1>Déconnexion en cours...</h1>
    </div>
  );
}

export default Logout;
