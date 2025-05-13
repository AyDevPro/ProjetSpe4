import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

function Documents() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/documents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setDocuments(data);
        } else {
          toast.error(data.error || "Erreur lors du chargement des documents");
        }
      } catch (err) {
        toast.error("Erreur de connexion au serveur");
      }
    };

    fetchDocuments();
  }, [token]);

  const getIcon = (type) =>
    type === "text" ? "📄" : type === "file" ? "📁" : "❓";

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📚 Mes documents</h2>
        <Link className="btn btn-primary btn-sm" to="/documents/new">
          ➕ Nouveau document
        </Link>
      </div>

      {documents.length === 0 ? (
        <p>Aucun document disponible.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Type</th>
              <th>Nom</th>
              <th>Dernière modification</th>
              <th>Modifié par</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc._id}>
                <td>{getIcon(doc.type)}</td>
                <td>{doc.name}</td>
                <td>
                  {new Date(doc.lastModified).toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td>{doc.lastModifiedBy?.username || "?"}</td>
                <td>
                  {doc.type === "text" ? (
                    <Link
                      to={`/documents/${doc._id}`}
                      className="btn btn-outline-secondary btn-sm me-2"
                    >
                      ✏️ Ouvrir
                    </Link>
                  ) : (
                    <a
                      href={`${import.meta.env.VITE_API_URL}${doc.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline-primary btn-sm me-2"
                    >
                      🔍 Voir
                    </a>
                  )}
                  {/* Supprimer : à implémenter plus tard */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Documents;
