import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Layout() {
  const { user } = useAuth();

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
        <Link className="navbar-brand" to="/">
          MonApp
        </Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">
            {!user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    S’inscrire
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Se connecter
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/me">
                    Profil
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/logout">
                    Se déconnecter
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <main className="container mt-5">
        <Outlet /> {/* zone pour charger les pages */}
      </main>
    </>
  );
}

export default Layout;
