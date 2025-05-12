import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="text-center mt-5">
      <h1>404</h1>
      <p>Page non trouvée.</p>
      <Link to="/" className="btn btn-primary mt-3">
        Retour à l’accueil
      </Link>
    </div>
  );
}

export default NotFound;
