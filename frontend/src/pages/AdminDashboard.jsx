import { useEffect, useState } from "react";
import { toast } from "react-toastify";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setUsers(data);
    } else {
      toast.error(data.error || "Erreur chargement utilisateurs");
    }
  };

  const handleAction = async (id, action) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/${action}/${id}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      fetchUsers();
    } else {
      toast.error(data.error || "Erreur action");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container mt-4">
      <h2>🛠️ Admin - Gestion des utilisateurs</h2>
      <table className="table mt-3">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>État</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.username || "?"}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.blocked ? "🚫 Bloqué" : "✅ Actif"}</td>
              <td>
                {u.role !== "admin" && (
                  <button
                    className={`btn btn-sm ${
                      u.blocked ? "btn-success" : "btn-danger"
                    }`}
                    onClick={() =>
                      handleAction(u._id, u.blocked ? "unblock" : "block")
                    }
                  >
                    {u.blocked ? "Débloquer" : "Bloquer"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
