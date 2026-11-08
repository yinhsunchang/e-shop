import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/auth/useAuth";

export default function Signin() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    typeof location.state?.from?.pathname === "string" &&
    location.state.from.pathname.startsWith("/") &&
    !location.state.from.pathname.startsWith("//")
      ? location.state.from.pathname
      : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError(t("signin.required"));
      return;
    }

    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError(t("signin.invalidCredentials"));
        return;
      }

      navigate(from, { replace: true });
    } catch {
      setError(t("signin.genericError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content justify padding-64 margin-top" id="signin">
      <h1 className="xlarge">{t("signin.title")}</h1>

      <hr style={{ width: "200px" }} className="opacity" />

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">{t("signin.email")}</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t("signin.emailPlaceholder")}
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="input large"
        />

        <label htmlFor="password">{t("signin.password")}</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder={t("signin.passwordPlaceholder")}
          value={password}
          minLength={8}
          required
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="input margin-bottom large"
        />

        {error && (
          <p
            role="alert"
            className="padding-large small center light-gray border"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          className="button dark-grey padding large block"
          disabled={loading}
        >
          {loading ? t("signin.loading") : t("signin.signin")}
        </button>
      </form>

      <p className="medium">
        {t("signin.notyet")}
        <Link to="/signup" className="hover-text-gray">
          {" "}
          {t("signin.signup")}
        </Link>
      </p>
    </div>
  );
}
