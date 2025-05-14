import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

function SharedDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [showHidden, setShowHidden] = useState(false);
  const token = localStorage.getItem("token");

  const fetchDocuments = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/documents?showHidden=${showHidden}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        const sharedDocs = data.filter(
          (doc) =>
            doc.owner !== user._id && doc.collaborators.includes(user._id)
        );
        setDocuments(sharedDocs);
      } else {
        toast.error(data.error || "Erreur lors du chargement des documents");
      }
    } catch (err) {
      toast.error("Erreur de connexion au serveur");
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [token, user._id, showHidden]);

  const handleHide = async (id) => {
    if (!window.confirm("Voulez-vous masquer ce document ?")) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/documents/${id}/hide`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur lors du masquage");
        return;
      }

      toast.success("Document masqué");
      fetchDocuments();
    } catch (err) {
      toast.error("Erreur réseau lors du masquage");
    }
  };

  return (
    <div className="container mt-4">
      <h2>📤 Documents partagés avec vous</h2>

      <div className="form-check mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          id="showHidden"
          checked={showHidden}
          onChange={() => setShowHidden((prev) => !prev)}
        />
        <label className="form-check-label" htmlFor="showHidden">
          Afficher les documents masqués
        </label>
      </div>

      {documents.length === 0 ? (
        <p>Aucun document partagé pour le moment.</p>
      ) : (
        <ul className="list-group mt-3">
          {documents.map((doc) => (
            <li
              key={doc._id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {doc.type === "text" ? (
                <Link
                  to={`/documents/${doc._id}`}
                  className="text-decoration-none"
                >
                  📝 {doc.name}
                </Link>
              ) : (
                <a
                  href={`${import.meta.env.VITE_API_URL}${doc.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-decoration-none"
                  download={doc.name}
                >
                  📎 {doc.name}
                </a>
              )}
              <button
                className="btn btn-sm btn-outline-warning"
                onClick={() => handleHide(doc._id)}
              >
                🙈 Masquer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SharedDocuments;
