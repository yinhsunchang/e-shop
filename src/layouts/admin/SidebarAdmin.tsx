import { Link, NavLink } from "react-router-dom";
import Switcher from "@/layouts/Switcher.tsx";
import { useTranslation } from "react-i18next";

const adminMenus = [
  {
    path: "/admin/dashboard",
    icon: "fa-gear",
    label: "navAdmin.dashboard",
  },
  {
    path: "/admin/products",
    icon: "fa-th",
    label: "navAdmin.products",
  },
  {
    path: "/admin/orders",
    icon: "fa-list",
    label: "navAdmin.orders",
  },
  {
    path: "/admin/subscribers",
    icon: "fa-user-plus",
    label: "navAdmin.subscribers",
  },
  {
    path: "/admin/messages",
    icon: "fa-comment",
    label: "navAdmin.messages",
  },
];

const SidebarAdmin = () => {
  const { t } = useTranslation();

  const navLinkStyles = ({ isActive }: { isActive: boolean }) => ({
    backgroundColor: isActive ? "#ccc" : "#000",
    color: isActive ? "#000" : "#ccc",
  });

  return (
    <nav
      className="sidebar bar-block small hide-small center"
      aria-label={t("navAdmin.navigation")}
    >
      {/* Navigation Admin */}
      {adminMenus.map(({ path, icon, label }) => (
        <NavLink
          key={path}
          to={path}
          title={t(label)}
          style={navLinkStyles}
          className="bar-item button"
        >
          <i className={`fa ${icon} xlarge padding`} aria-hidden="true" />
          <p>{t(label)}</p>
        </NavLink>
      ))}

      {/* Language Switcher */}
      <button
        type="button"
        className="bar-item dropdown-hover button black"
        style={{ position: "fixed", bottom: 100, left: 0, width: 120 }}
        title={t("navAdmin.languages")}
      >
        <i className="fa fa-globe xlarge padding" aria-hidden="true"></i>
        <p>{t("navAdmin.languages")}</p>
        <div
          className="dropdown-content"
          style={{ position: "relative", zIndex: 100, minWidth: 0 }}
        >
          <Switcher />
        </div>
      </button>

      {/* Back to Shop */}
      <Link
        to="/"
        style={{ position: "fixed", bottom: 0, left: 0, width: 120 }}
        className="bar-item button black"
        title={t("navAdmin.shop")}
      >
        <i className="fa fa-home xlarge padding" aria-hidden="true"></i>
        <p>{t("navAdmin.shop")}</p>
      </Link>
    </nav>
  );
};

export default SidebarAdmin;
