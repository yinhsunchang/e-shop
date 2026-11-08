import { Navigate, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/auth/useAuth";

export default function RouteAdmin() {
  const { t } = useTranslation();
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="padding-64 center">
        {t("routeProtected.loading")}
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (profile?.role !== "admin") {
    return <Navigate to="/user/account" replace />;
  }

  return <Outlet />;
}
