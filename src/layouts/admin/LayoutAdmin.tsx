import { Outlet } from "react-router-dom";
import SidebarAdmin from "./SidebarAdmin.tsx";
import NavbarAdmin from "./NavbarAdmin.tsx";
import FooterAdmin from "./FooterAdmin.tsx";

const LayoutAdmin = () => {
  return (
    <>
      <SidebarAdmin />
      <NavbarAdmin />
      <div className="layout-site padding-large" id="main">
        <main className="layout-main">
          <Outlet />
        </main>
        <FooterAdmin />
      </div>
    </>
  );
};

export default LayoutAdmin;
