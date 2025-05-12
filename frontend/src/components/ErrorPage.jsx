function ErrorPage({ code = 403, message = "Accès refusé" }) {
  return (
    <div className="text-center mt-5">
      <h1>{code}</h1>
      <p>{message}</p>
    </div>
  );
}

export default ErrorPage;
