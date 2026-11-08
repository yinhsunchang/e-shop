import "./Dashboard.css";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/auth/useAuth";
import type { ProfileProps } from "@/types/profile";

const dashboardLinks = [
  {
    title: "products",
    path: "/admin/products",
    label: "productsLink",
  },
  {
    title: "orders",
    path: "/admin/orders",
    label: "ordersLink",
  },
  {
    title: "subscribers",
    path: "/admin/subscribers",
    label: "subscribersLink",
  },
  {
    title: "messages",
    path: "/admin/messages",
    label: "messagesLink",
  },
];

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, signOut, loading } = useAuth();
  const [profile, setProfile] = useState<ProfileProps | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error) throw error;

        setProfile(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setProfileLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

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

  if (loading) {
    return (
      <div role="status" className="padding-64 center">
        <p>{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <h1 className="xlarge">{t("dashboard.title")}</h1>
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="dashboard-card">
            <h2 className="large">{t("dashboard.profile")}</h2>
            <p>
              {t("dashboard.email")}
              {profileLoading ? t("loading") : profile?.email}
            </p>
            <p>
              {t("dashboard.name")}
              {profileLoading
                ? t("loading")
                : profile?.display_name || t("dashboard.notSet")}
            </p>
            <p>
              {t("dashboard.role")}
              {profileLoading ? t("loading") : profile?.role}
            </p>
          </div>
        </div>

        {dashboardLinks.map((item) => (
          <div className="dashboard-content margin-top" key={item.title}>
            <div className="dashboard-card">
              <h2 className="large">{t(`dashboard.${item.title}`)}</h2>

              <Link
                className="dashboard-link button light-gray right"
                to={item.path}
              >
                {t(`dashboard.${item.label}`)}
              </Link>
            </div>
          </div>
        ))}

        <div className="dashboard-content margin-top">
          <div className="dashboard-card">
            <button
              type="button"
              className="button black block large round-large"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              {signingOut ? t("dashboard.signingout") : t("dashboard.signout")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
