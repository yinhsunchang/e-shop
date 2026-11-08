import Helmet from "./Helmet.tsx";
import NavbarMain from "./NavbarMain.tsx";
import SocialLinks from "./SocialLinks.tsx";
import Chat from "./Chat.tsx";
import CartDrawer from "@/cart/CartDrawer.tsx";
import FooterMain from "./FooterMain.tsx";
import { Outlet } from "react-router-dom";

const LayoutMain = () => {
  return (
    <>
      <div className="layout-site">
        <Helmet />
        <NavbarMain />
        <SocialLinks />
        <Chat />
        <CartDrawer />
        <main id="main-content" className="layout-main">
          <Outlet />
        </main>
        <div className="padding-large">
          <FooterMain />
        </div>
      </div>
    </>
  );
};

export default LayoutMain;
