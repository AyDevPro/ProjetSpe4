import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Vérifie le token et récupère l’utilisateur
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${import.meta.env.VITE_API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setUser(data);
        else {
          localStorage.removeItem("token");
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    fetch(`${import.meta.env.VITE_API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setUser(data);
      });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
