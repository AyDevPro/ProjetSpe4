import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function NewTextDocument() {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleTextSubmit = async (e) => {
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
      toast.success("Document texte créé !");
      navigate(`/documents/${data._id}`);
    } else {
      toast.error(data.error || "Erreur lors de la création");
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Aucun fichier sélectionné");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/documents/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await res.json();

    if (res.ok) {
      toast.success("Fichier téléchargé !");
      navigate("/documents");
    } else {
      toast.error(data.error || "Erreur lors du téléchargement");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <h2 className="mb-4">➕ Nouveau document</h2>

      <form onSubmit={handleTextSubmit} className="mb-5">
        <h5>📄 Document texte</h5>
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

      <form onSubmit={handleFileUpload}>
        <h5 className="mt-4">📎 Ajouter un fichier (PDF ou image)</h5>
        <div
          className="mb-3 p-4 border border-secondary rounded text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length) {
              setFile(e.dataTransfer.files[0]);
            }
          }}
        >
          <p className="mb-2">Glissez un fichier ici</p>
          <input
            type="file"
            className="form-control"
            accept="image/*,.pdf"
            onChange={handleFileChange}
          />
          {file && <div className="mt-2">✅ {file.name}</div>}
        </div>
        <button className="btn btn-success w-100">Uploader</button>
      </form>
    </div>
  );
}

export default NewTextDocument;
