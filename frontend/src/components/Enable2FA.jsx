import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

function Enable2FA() {
  const { user, setUser } = useAuth();
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [token, setToken] = useState("");
  const [enabled, setEnabled] = useState(false);
  const jwt = localStorage.getItem("token");

  useEffect(() => {
    if (user?.twoFactorSecret) {
      setEnabled(true);
    }
  }, [user]);

  const generate2FA = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/2fa/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    const data = await res.json();
    if (res.ok) {
      setQrCode(data.qr);
      setSecret(data.secret);
    } else {
      toast.error("Erreur lors de la génération du 2FA");
    }
  };

  const verify2FA = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/2fa/verify`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("✅ 2FA activé !");
      setUser({ ...user, twoFactorSecret: secret });
      setEnabled(true);
      setQrCode(null);
      setToken("");
    } else {
      toast.error(data.error || "Code invalide");
    }
  };

  const disable2FA = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/2fa/disable`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (res.ok) {
      toast.success("🔓 2FA désactivé");
      setUser({ ...user, twoFactorSecret: undefined });
      setEnabled(false);
    } else {
      toast.error("Erreur lors de la désactivation");
    }
  };

  return (
    <div className="mt-5">
      <h5>Authentification à deux facteurs</h5>
      {enabled ? (
        <>
          <p className="text-success">🔐 2FA activé</p>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={disable2FA}
          >
            Désactiver le 2FA
          </button>
        </>
      ) : (
        <>
          {!qrCode ? (
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={generate2FA}
            >
              Activer le 2FA
            </button>
          ) : (
            <div className="mt-3">
              <p>📱 Scanne ce QR Code avec une application TOTP :</p>
              <img src={qrCode} alt="QR Code 2FA" />
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Code à 6 chiffres"
                  className="form-control mb-2"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
                <button className="btn btn-success btn-sm" onClick={verify2FA}>
                  Valider
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Enable2FA;
