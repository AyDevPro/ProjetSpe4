import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");
    navigate("/login"); // ou '/' selon ton choix
  }, [navigate]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Déconnexion</h2>
      <p>Vous êtes déconnecté.</p>
    </div>
  );
}

export default Logout;
