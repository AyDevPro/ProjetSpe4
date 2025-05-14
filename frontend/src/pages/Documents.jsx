import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { FaFilePdf, FaFileImage, FaFileAlt, FaFile } from "react-icons/fa";


function Documents() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/documents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          const ownedDocuments = data.filter(doc => doc.owner === user._id);
          setDocuments(ownedDocuments);
        } else {
          toast.error(data.error || "Erreur lors du chargement des documents");
        }
      } catch (err) {
        toast.error("Erreur de connexion au serveur");
      }
    };

    fetchDocuments();
  }, [token]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) setUsers(data);
      } catch (err) {
        toast.error("Erreur lors du chargement des utilisateurs");
      }
    };
  
    fetchUsers();
  }, []);

  const getIcon = (doc) => {
    if (doc.type === "text") return <FaFileAlt />;
    if (doc.type === "file") {
      const ext = doc.name.split(".").pop().toLowerCase();
      if (ext === "pdf") return <FaFilePdf color="red" />;
      if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext))
        return <FaFileImage color="teal" />;
      return <FaFile />;
    }
    return <FaFile />;
  };

  const deleteDocument = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) return;
  
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/documents/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur lors de la suppression");
        return;
      }
  
      toast.success("Document supprimé");
      setDocuments((prev) => prev.filter((doc) => doc._id !== id));
    } catch (err) {
      toast.error("Erreur réseau lors de la suppression");
    }
  };

  const handleShare = async (docId) => {
    const userList = users.filter(u => u._id !== user._id);
    const email = window.prompt(
      `Sélectionnez un utilisateur:\n${userList.map(u => `${u.email}`).join("\n")}`
    );
  
    if (!email) return;
  
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/documents/${docId}/invite`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
  
      const data = await res.json();
      if (res.ok) {
        toast.success("Utilisateur invité avec succès");
      } else {
        toast.error(data.error || "Erreur lors de l'invitation");
      }
    } catch (err) {
      toast.error("Erreur réseau lors de l'invitation");
    }
  };
  
  const hideDocument = async (id) => {
    if (!window.confirm("Voulez-vous masquer ce document ?")) return;
  
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/documents/${id}/hide`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
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
                <td>{getIcon(doc)}</td>
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
                    <>
                      <a
                        href={`${import.meta.env.VITE_API_URL}${doc.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-primary btn-sm me-2"
                      >
                        🔍 Voir
                      </a>
                      <a
                        href={`${import.meta.env.VITE_API_URL}${doc.fileUrl}`}
                        download
                        className="btn btn-outline-success btn-sm me-2"
                      >
                        ⬇️ Télécharger
                      </a>
                    </>
                  )}

                  {/* Bouton de suppression */}
                  {doc.owner === user._id ? (
                    <button
                      onClick={() => deleteDocument(doc._id)}
                      className="btn btn-outline-danger btn-sm"
                    >
                      🗑️ Supprimer
                    </button>
                  ) : (
                    <button
                      onClick={() => hideDocument(doc._id)}
                      className="btn btn-outline-warning btn-sm"
                    >
                      🙈 Masquer
                    </button>
                  )}
                  {doc.owner === user._id && (
                    <button
                      onClick={() => handleShare(doc._id)}
                      className="btn btn-outline-info btn-sm me-2"
                    >
                      🤝 Partager
                    </button>
                  )}
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
