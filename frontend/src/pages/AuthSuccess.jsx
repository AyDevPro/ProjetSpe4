import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    console.log(token);

    if (token) {
      localStorage.setItem("token", token);
      navigate("/documents");
    } else {
      navigate("/login");
    }
  }, []);

  return <p>Connexion en cours...</p>;
}