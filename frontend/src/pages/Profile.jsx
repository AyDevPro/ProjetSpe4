import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import Enable2FA from "../components/Enable2FA";

function Profile() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [editField, setEditField] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");

  const { setUser: setAuthUser } = useAuth();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return setMessage("Non connecté");

    fetch(`${import.meta.env.VITE_API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => (data.error ? setMessage(data.error) : setUser(data)))
      .catch(() => setMessage("Erreur réseau"));
  }, [token]);

  const handleUpdateField = async (field) => {
    const update = {
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    };

    if (field === "avatar" && avatarFile) {
      const fileReader = new FileReader();
      fileReader.onloadend = async () => {
        update.avatar = fileReader.result;
        await sendUpdate(update);
      };
      fileReader.readAsDataURL(avatarFile);
    } else {
      await sendUpdate(update);
    }
  };

  const sendUpdate = async (body) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.user) {
      setUser(data.user);
      setAuthUser(data.user);
      setEditField(null);
      setAvatarFile(null);
      toast.success("Profil mis à jour !");
    } else {
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/me/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("Mot de passe mis à jour !");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStrength("");
      setShowPasswordForm(false);
    } else {
      toast.error(data.error || "Erreur lors du changement de mot de passe");
    }
  };

  const checkStrength = (pwd) => {
    if (pwd.length < 6) return "❌ Trop court";
    if (!/[A-Z]/.test(pwd)) return "⚠️ Majuscule manquante";
    if (!/[0-9]/.test(pwd)) return "⚠️ Chiffre manquant";
    if (!/[!@#$%^&*]/.test(pwd)) return "⚠️ Symbole manquant";
    return "✅ Mot de passe fort";
  };

  useEffect(() => {
    if (newPassword) setPasswordStrength(checkStrength(newPassword));
    else setPasswordStrength("");
  }, [newPassword]);

  if (message) return <p className="p-4 text-center text-danger">{message}</p>;

  return (
    <div className="container mt-4 d-flex justify-content-center">
      <div
        className="card shadow-sm p-4"
        style={{ maxWidth: "600px", width: "100%" }}
      >
        <h2 className="text-center mb-4">Mon profil</h2>
        {user ? (
          <>
            {/* Avatar */}
            <div className="d-flex flex-column align-items-center mb-4">
              <img
                src={
                  user.avatar ||
                  "images/compte-utilisateur.png"
                }
                alt="Avatar"
                className="rounded-circle mb-2"
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
              />
              {editField === "avatar" ? (
                <div className="d-flex flex-column align-items-center w-100">
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control mb-2"
                    onChange={(e) => setAvatarFile(e.target.files[0])}
                  />
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleUpdateField("avatar")}
                  >
                    💾 Enregistrer
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setEditField("avatar")}
                >
                  ✏️ Modifier l’avatar
                </button>
              )}
            </div>

            {/* Username */}
            <div className="mb-3">
              <label className="form-label fw-bold">Nom d’utilisateur</label>
              <div className="d-flex align-items-center">
                {editField === "username" ? (
                  <>
                    <input
                      value={user.username}
                      onChange={(e) =>
                        setUser((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      className="form-control me-2"
                    />
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleUpdateField("username")}
                    >
                      💾
                    </button>
                  </>
                ) : (
                  <>
                    <span className="me-2">{user.username}</span>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setEditField("username")}
                    >
                      ✏️
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label fw-bold">Adresse email</label>
              <div className="d-flex align-items-center">
                {editField === "email" ? (
                  <>
                    <input
                      value={user.email}
                      onChange={(e) =>
                        setUser((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="form-control me-2"
                    />
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleUpdateField("email")}
                    >
                      💾
                    </button>
                  </>
                ) : (
                  <>
                    <span className="me-2">{user.email}</span>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setEditField("email")}
                    >
                      ✏️
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Mot de passe */}
            <hr className="my-4" />
            <h5 className="mb-3">Mot de passe</h5>
            {!showPasswordForm ? (
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => setShowPasswordForm(true)}
              >
                ✏️ Modifier le mot de passe
              </button>
            ) : (
              <form onSubmit={handlePasswordChange}>
                <div className="mb-3">
                  <label className="form-label">Ancien mot de passe</label>
                  <input
                    type="password"
                    className="form-control"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Nouveau mot de passe</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  {passwordStrength && (
                    <small className="form-text">
                      Force : {passwordStrength}
                    </small>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirmation</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPasswordForm(false)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-warning">
                    💾 Mettre à jour
                  </button>
                </div>
              </form>
            )}

            {/* 2FA */}
            <hr className="my-4" />
            <Enable2FA />
          </>
        ) : (
          <p className="text-center">Chargement…</p>
        )}
      </div>
    </div>
  );
}

export default Profile;
