import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token);
        toast.success("Connexion réussie !");
        navigate("/me");
      } else {
        toast.error(data.error || "Erreur inconnue");
      }
    } catch {
      setMessage("Erreur réseau");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit} className="mt-3">
        <input
          className="form-control mb-2"
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          className="form-control mb-2"
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button className="btn btn-primary" type="submit">
          Se connecter
        </button>
      </form>
      {message && <div className="alert alert-danger mt-3">{message}</div>}
    </div>
  );
}

export default Login;
