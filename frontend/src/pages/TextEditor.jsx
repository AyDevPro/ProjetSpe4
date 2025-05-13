import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

function TextEditor() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDoc = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      const current = data.find((d) => d._id === id);

      if (current) {
        setDoc(current);
        setContent(current.content || "");
      } else {
        toast.error("Document introuvable");
      }
    };

    fetchDoc();
  }, [id, token]);

  const handleSave = async () => {
    setIsSaving(true);
    const res = await fetch(`${import.meta.env.VITE_API_URL}/documents/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    if (res.ok) {
      toast.success("💾 Sauvegardé");
    } else {
      toast.error("Erreur lors de la sauvegarde");
    }
    setIsSaving(false);
  };

  if (!doc) return <p className="text-center mt-5">Chargement du document…</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-3">📝 {doc.name}</h2>
      <textarea
        className="form-control"
        style={{ minHeight: "300px", fontFamily: "monospace" }}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="d-flex justify-content-end mt-3">
        <button
          className="btn btn-success"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Sauvegarde…" : "💾 Sauvegarder"}
        </button>
      </div>
    </div>
  );
}

export default TextEditor;
