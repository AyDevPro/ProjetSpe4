import { useEffect, useState } from "react";

function Profile() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Non connecté");
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setMessage(data.error);
        } else {
          setUser(data);
        }
      })
      .catch(() => setMessage("Erreur réseau"));
  }, []);

  if (message) return <p style={{ padding: "2rem" }}>{message}</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Profil</h2>
      {user ? (
        <>
          <p>
            <strong>Nom d’utilisateur :</strong> {user.username}
          </p>
          <p>
            <strong>Email :</strong> {user.email}
          </p>
        </>
      ) : (
        <p>Chargement...</p>
      )}
    </div>
  );
}

export default Profile;
