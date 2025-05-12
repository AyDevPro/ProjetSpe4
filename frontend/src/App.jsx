import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function App() {
  const [message, setMessage] = useState("Chargement...");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Appel Hello World
    fetch(`${import.meta.env.VITE_API_URL}/hello`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Erreur de connexion"));

    // Vérifie si un token est présent
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>{message}</h1>

      <nav
        style={{
          marginTop: "1rem",
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        {isAuthenticated ? (
          <>
            <Link to="/profile">Profil</Link>
            <Link to="/logout">Se déconnecter</Link>
          </>
        ) : (
          <>
            <Link to="/register">S’inscrire</Link>
            <Link to="/login">Se connecter</Link>
          </>
        )}
      </nav>
    </div>
  );
}

export default App;
