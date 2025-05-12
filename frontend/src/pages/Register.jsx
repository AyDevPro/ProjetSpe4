import { useState } from "react";

function Register() {
  const [form, setForm] = useState({ email: "", password: "", username: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Inscription réussie ! Vous pouvez vous connecter.");
        setForm({ email: "", password: "", username: "" });
      } else {
        setMessage(data.error || "Erreur inconnue");
      }
    } catch (err) {
      setMessage("Erreur réseau");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Inscription</h2>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "300px",
        }}
      >
        <input
          type="text"
          name="username"
          placeholder="Nom d'utilisateur"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">S'inscrire</button>
      </form>
      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </div>
  );
}

export default Register;
