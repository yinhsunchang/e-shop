import "./Account.css";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import useProfile from "./useProfile";

export default function Account() {
  const { t } = useTranslation();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading, error } = useProfile();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);

    try {
      await signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setSigningOut(false);
    }
  }

  if (authLoading) {
    return (
      <div role="status" className="padding-64 center">
        <p>{t("loading")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="account-page margin-top">
        <div className="account-container">
          <h1 className="xlarge">{t("account.title")}</h1>

          {error && <p role="alert">{error}</p>}

          <section className="account-content">
            <div className="account-card">
              <h2 className="large">{t("account.profile")}</h2>

              <p>
                {t("account.email")}
                {user?.email}
              </p>

              {profileLoading ? (
                <p role="status">{t("loading")}</p>
              ) : (
                <p>
                  {t("account.name")}
                  {profile?.display_name || t("account.notSet")}
                </p>
              )}
            </div>
          </section>

          <section className="account-content margin-top">
            <div className="account-card">
              <h2 className="large">{t("account.address")}</h2>
              <p>{profile?.address || t("account.notSet")}</p>
            </div>
          </section>

          <section className="account-content margin-top">
            <div className="account-card">
              <h2 className="large">{t("account.orders")}</h2>
              <Link
                className="account-link button light-gray right"
                to="/user/orders"
              >
                {t("account.ordersLink")}
              </Link>
            </div>
          </section>

          <section className="account-content margin-top">
            <div className="account-card">
              <button
                type="button"
                className="button black block large round-large"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                {signingOut ? t("account.signingout") : t("account.signout")}
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
