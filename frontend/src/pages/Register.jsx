import { useState } from "react";
import { toast } from "react-toastify";

function Register() {
  const [form, setForm] = useState({ email: "", password: "", username: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Inscription réussie ! Vous pouvez vous connecter.");
        setForm({ email: "", password: "", username: "" });
      } else {
        toast.error(data.error || "Erreur inconnue");
      }
    } catch (err) {
      toast.error("Erreur réseau");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Inscription</h2>
      <form
        onSubmit={handleSubmit}
        className="mx-auto"
        style={{ maxWidth: "400px" }}
      >
        <div className="mb-3">
          <label className="form-label">Nom d'utilisateur</label>
          <input
            type="text"
            name="username"
            className="form-control"
            placeholder="Nom d'utilisateur"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Mot de passe</label>
          <input
            type="password"
            name="password"
            className="form-control"
            placeholder="Mot de passe"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          S'inscrire
        </button>
      </form>
    </div>
  );
}

export default Register;
