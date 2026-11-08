import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/auth/useAuth";

export default function Signup() {
  const { t } = useTranslation();
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email || !password) {
      setError(t("signup.required"));
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email, password);

      if (error) {
        setError(t("signup.signupFailed"));
        return;
      }

      setSuccess(t("signup.confirmEmail"));
      setPassword("");
    } catch {
      setError(t("signup.genericError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content justify padding-64 margin-top" id="signup">
      <h1 className="xlarge">{t("signup.title")}</h1>

      <hr style={{ width: "200px" }} className="opacity" />

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">{t("signup.email")}</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t("signup.emailPlaceholder")}
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading || !!success}
          className="input large"
        />

        <label htmlFor="password">{t("signup.password")}</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder={t("signup.password")}
          value={password}
          minLength={8}
          required
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading || !!success}
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

        {success && (
          <p
            role="status"
            className="padding-large small center light-gray border"
          >
            {success}
          </p>
        )}

        <button
          type="submit"
          className="button dark-grey padding large block"
          disabled={loading || !!success}
        >
          {loading ? t("signup.loading") : t("signup.signup")}
        </button>
      </form>

      <p className="medium">
        {t("signup.already")}
        <Link to="/signin" className="hover-text-gray">
          {" "}
          {t("signup.signin")}
        </Link>
      </p>
    </div>
  );
}
