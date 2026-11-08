import { Link, NavLink } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Switcher from "@/layouts/Switcher.tsx";

const adminMenus = [
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

const NavbarAdmin = () => {
  const { t } = useTranslation();

  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (event: PointerEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [showMenu]);

  // Detect page scrolling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinkStyles = ({ isActive }: { isActive: boolean }) => ({
    backgroundColor: isActive ? "#000" : "",
    color: isActive ? "#fff" : "",
  });

  return (
    <>
      <div className="top large">
        <div ref={menuRef}>
          <div
            className={`bar ${scrolled ? "card animate-top white" : ""}`}
            id="myNavbar"
          >
            {/* Mobile Menu Button */}
            <button
              type="button"
              title={
                showMenu ? t("navAdmin.closeMenu") : t("navAdmin.openMenu")
              }
              className="bar-item button hide-medium hide-large right"
              onClick={() => {
                setShowMenu((prev) => !prev);
              }}
              aria-label={
                showMenu ? t("navAdmin.closeMenu") : t("navAdmin.openMenu")
              }
              aria-expanded={showMenu}
              aria-controls="admin-mobile-menu"
            >
              <i
                className={`fa ${showMenu ? "fa-times" : "fa-bars"} medium`}
                aria-hidden="true"
              />
            </button>

            {/* Dashboard */}
            <NavLink
              to="/admin/dashboard"
              title={t("navAdmin.dashboard")}
              style={navLinkStyles}
              className="bar-item button hide-medium hide-large"
              aria-label={t("navAdmin.dashboard")}
            >
              <i className="fa fa-gear" aria-hidden="true"></i>
            </NavLink>

            {/* Language Switcher */}
            <button
              type="button"
              className="bar-item dropdown-hover button hide-medium hide-large"
              title={t("navAdmin.languages")}
            >
              <i className="fa fa-globe" aria-hidden="true"></i>
              <div
                className="dropdown-content"
                style={{
                  position: "fixed",
                  top: 0,
                  marginLeft: 30,
                  zIndex: 100,
                  minWidth: 0,
                }}
              >
                <Switcher />
              </div>
            </button>
          </div>

          {/* Mobile Navigation */}
          {showMenu && (
            <nav
              id="admin-mobile-menu"
              aria-label={t("navAdmin.navigation")}
              className="bar-block white medium center card hide show hide-large hide-medium"
            >
              {adminMenus.map(({ path, icon, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  title={t(label)}
                  className="bar-item button"
                  style={navLinkStyles}
                  onClick={() => setShowMenu(false)}
                >
                  <i className={`fa ${icon} padding`} aria-hidden="true" />
                  {t(label)}
                </NavLink>
              ))}

              {/* Back to Shop */}
              <Link
                to="/"
                title={t("navAdmin.shop")}
                className="bar-item button"
                onClick={() => setShowMenu(false)}
              >
                <i
                  className="fa fa-shopping-cart padding"
                  aria-hidden="true"
                ></i>
                {t("navAdmin.shop")}
              </Link>
            </nav>
          )}
        </div>
      </div>
    </>
  );
};

export default NavbarAdmin;
