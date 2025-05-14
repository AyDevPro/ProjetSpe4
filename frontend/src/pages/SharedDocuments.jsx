import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

function SharedDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/documents`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          // Ne garde que les documents que l'utilisateur possède ou qui lui sont partagés
          const sharedDocs = data.filter(
            (doc) =>
              doc.owner === user._id || doc.collaborators.includes(user._id)
          );
          setDocuments(sharedDocs);
        } else {
          toast.error(data.error || "Erreur lors du chargement des documents");
        }
      } catch (err) {
        toast.error("Erreur de connexion au serveur");
      }
    };

    fetchDocuments();
  }, [token, user._id]);

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
      setDocuments((prev) => prev.filter((doc) => doc._id !== id));
    } catch (err) {
      toast.error("Erreur réseau lors du masquage");
    }
  };

  return (
    <div className="container mt-4">
      <h2>📤 Documents partagés avec vous</h2>
      {documents.length === 0 ? (
        <p>Aucun document partagé pour le moment.</p>
      ) : (
        <ul className="list-group mt-3">
          {documents.map((doc) => (
            <li
              key={doc._id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <Link
                to={`/documents/${doc._id}`}
                className="text-decoration-none"
              >
                📝 {doc.name}
              </Link>

              <div>
                {doc.owner === user._id ? (
                  <span className="badge text-bg-primary me-2">
                    Propriétaire
                  </span>
                ) : (
                  <>
                    <span className="badge text-bg-secondary me-2">
                      Collaborateur
                    </span>
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => handleHide(doc._id)}
                    >
                      🙈 Masquer
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SharedDocuments;
