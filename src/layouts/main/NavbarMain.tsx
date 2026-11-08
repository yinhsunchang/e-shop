import { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Switcher from "@/layouts/Switcher.tsx";
import Cart from "@/cart/Cart.tsx";

const collections = [
  { path: "/products/a", label: "nav.collectionA" },
  { path: "/products/b", label: "nav.collectionB" },
  { path: "/products/c", label: "nav.collectionC" },
  { path: "/products/d", label: "nav.collectionD" },
  { path: "/products/e", label: "nav.collectionE" },
];

const navLinks = [
  { path: "/about", label: "nav.about" },
  { path: "/contact", label: "nav.contact" },
  { path: "/signin", label: "nav.signin" },
];

const NavbarMain = () => {
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

  // Scroll effect
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
          <div className={`bar ${scrolled ? "card animate-top white" : ""}`}>
            {/* Menu */}
            <button
              type="button"
              title={showMenu ? t("nav.closeMenu") : t("nav.openMenu")}
              className="bar-item button"
              onClick={(event) => {
                event.preventDefault();
                setShowMenu((prev) => !prev);
              }}
              aria-label={showMenu ? t("nav.closeMenu") : t("nav.openMenu")}
              aria-expanded={showMenu}
              aria-controls="main-navigation"
            >
              <i
                className={`fa ${showMenu ? "fa-times" : "fa-bars"} medium`}
                aria-hidden="true"
              />
            </button>

            {/* Language Switcher */}
            <button
              type="button"
              className="bar-item dropdown-hover button"
              title={t("nav.languages")}
            >
              <i className="fa fa-globe medium" aria-hidden="true"></i>
              <div
                className="dropdown-content"
                style={{
                  position: "fixed",
                  top: 0,
                  marginLeft: 28,
                  zIndex: 100,
                  minWidth: 0,
                }}
              >
                <Switcher />
              </div>
            </button>

            {/* BRAND */}
            <Link
              to="/"
              title={t("nav.home")}
              className="bar-item"
              style={{
                fontFamily: "Instrument Serif",
                position: "absolute",
                left: "50%",
                top: 0,
                transform: "translate(-50%,0%)",
                letterSpacing: "0.12em",
                whiteSpace: "nowrap",
              }}
              onClick={() => setShowMenu(false)}
            >
              <b className="large">STYLE-D</b>
            </Link>

            {/* Cart */}
            <div className="right" title={t("nav.cart")}>
              <Cart />
            </div>

            {/* Account */}
            <Link
              to="/signin"
              title={t("nav.signin")}
              className="bar-item button right"
              aria-label={t("nav.signin")}
            >
              <i className="fa fa-user medium" aria-hidden="true"></i>
            </Link>

            {/* Search */}
            <Link
              to="/search"
              title={t("nav.search")}
              className="bar-item button right hide-small"
              aria-label={t("nav.search")}
            >
              <i className="fa fa-search medium" aria-hidden="true"></i>
            </Link>
          </div>

          {/* Navigation Menu */}
          {showMenu && (
            <nav
              id="main-navigation"
              className="bar-block white hide show center card"
              aria-label={t("nav.mainNavigation")}
            >
              <div
                className="large text-dark-grey"
                style={{ fontWeight: "bold" }}
              >
                <NavLink
                  to="/search"
                  title={t("nav.search")}
                  className="bar-item button"
                  style={navLinkStyles}
                  onClick={() => setShowMenu(false)}
                >
                  <i className="fa fa-search medium" aria-hidden="true"></i>
                </NavLink>

                {collections.map(({ path, label }) => (
                  <NavLink
                    key={path}
                    to={path}
                    title={t(label)}
                    className="bar-item button"
                    style={navLinkStyles}
                    onClick={() => setShowMenu(false)}
                  >
                    {t(label)}
                  </NavLink>
                ))}
              </div>

              {navLinks.map(({ path, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  title={t(label)}
                  className="bar-item button medium"
                  style={navLinkStyles}
                  onClick={() => setShowMenu(false)}
                >
                  {t(label)}
                </NavLink>
              ))}
            </nav>
          )}
        </div>
      </div>
    </>
  );
};

export default NavbarMain;
