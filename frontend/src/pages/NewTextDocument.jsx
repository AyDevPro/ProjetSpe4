import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function NewTextDocument() {
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${import.meta.env.VITE_API_URL}/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("Document créé !");
      navigate(`/documents/${data._id}`); // Redirection vers l’éditeur (à venir)
    } else {
      toast.error(data.error || "Erreur lors de la création");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-4">➕ Nouveau document texte</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nom du document</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ex : Rapport projet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary w-100">Créer</button>
      </form>
    </div>
  );
}

export default NewTextDocument;
