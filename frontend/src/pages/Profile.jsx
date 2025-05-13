import { useEffect, useState } from "react";

function Profile() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return setMessage("Non connecté");

    fetch(`${import.meta.env.VITE_API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => (data.error ? setMessage(data.error) : setUser(data)))
      .catch(() => setMessage("Erreur réseau"));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    let avatarBase64 = null;

    if (avatarFile) {
      const fileReader = new FileReader();
      fileReader.onloadend = async () => {
        avatarBase64 = fileReader.result;

        const res = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: user.username,
            email: user.email,
            avatar: avatarBase64,
          }),
        });

        const data = await res.json();
        if (data.user) setUser(data.user);
      };

      fileReader.readAsDataURL(avatarFile);
    }
  };

  if (message) return <p style={{ padding: "2rem" }}>{message}</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Profil</h2>
      {user ? (
        <form onSubmit={handleUpdate}>
          <p>
            <strong>Nom d’utilisateur :</strong>{" "}
            <input
              value={user.username || ""}
              onChange={(e) =>
                setUser((prev) => ({ ...prev, username: e.target.value }))
              }
            />
          </p>
          <p>
            <strong>Email :</strong>{" "}
            <input
              value={user.email || ""}
              onChange={(e) =>
                setUser((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </p>
          {user.avatar && (
            <img
              src={user.avatar}
              alt="Avatar"
              style={{ width: "100px", borderRadius: "50%" }}
            />
          )}
          <p>
            <strong>Nouvel avatar :</strong>{" "}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files[0])}
            />
          </p>
          <button type="submit">Mettre à jour</button>
        </form>
      ) : (
        <p>Chargement…</p>
      )}
    </div>
  );
}

export default Profile;
