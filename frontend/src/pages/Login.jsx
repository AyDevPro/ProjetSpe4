import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [userPending, setUserPending] = useState(null); // Contient _id, email, username
  const [twoFactorToken, setTwoFactorToken] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      if (data.twoFactor) {
        // Étape 2FA
        setTwoFactorRequired(true);
        setUserPending(data);
        toast.info("Code 2FA requis");
      } else {
        login(data.token);
        navigate("/");
        toast.success("Connecté !");
      }
    } else {
      toast.error(data.error || "Erreur lors de la connexion");
    }
  };

  const handle2FA = async (e) => {
    e.preventDefault();

    const res = await fetch(`${import.meta.env.VITE_API_URL}/2fa/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userPending.userId,
        token: twoFactorToken,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      login(data.token);
      navigate("/");
      toast.success("Connecté avec 2FA !");
    } else {
      toast.error(data.error || "Code invalide");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-4">Connexion</h2>

      {!twoFactorRequired ? (
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email ou nom d'utilisateur</label>
            <input
              type="text"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary w-100">Se connecter</button>
        </form>  
      ) : (
        <form onSubmit={handle2FA}>
          <p>Un code 2FA est requis pour finaliser la connexion.</p>
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Code à 6 chiffres"
            value={twoFactorToken}
            onChange={(e) => setTwoFactorToken(e.target.value)}
            required
          />
          <button className="btn btn-success w-100">Valider le code</button>
        </form>
      )}
      <div class="auth-links">
        <p>Connexion avec des apps externes :</p>
        <a class="btn btn-white google-button" href={`${import.meta.env.VITE_API_URL}/auth/google`}>Login with Google</a><br></br>
        {/* <a href="/auth/facebook">Login with Facebook</a> */}
      </div>
    </div>
  );
}

export default Login;
