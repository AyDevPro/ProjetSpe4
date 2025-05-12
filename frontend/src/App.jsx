import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Chargement...");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/hello`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Erreur de connexion"));
  }, []);

  return (
    <div className="text-center mt-5">
      <h1>{message}</h1>
    </div>
  );
}

export default App;
