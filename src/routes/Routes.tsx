import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "./ScrollToTop.ts";

import LayoutMain from "@/layouts/main/LayoutMain.tsx";
import Page404 from "@/pages/404/Page404.tsx";
import PageHome from "@/pages/home/PageHome.tsx";
import PageAbout from "@/pages/about/PageAbout.tsx";
import PageContact from "@/pages/contact/PageContact.tsx";
import ProductSearch from "@/pages/product/ProductSearch.tsx";
import PageCollectionA from "@/pages/product/collection/PageCollectionA.tsx";
import PageCollectionB from "@/pages/product/collection/PageCollectionB.tsx";
import PageCollectionC from "@/pages/product/collection/PageCollectionC.tsx";
import PageCollectionD from "@/pages/product/collection/PageCollectionD.tsx";
import PageCollectionE from "@/pages/product/collection/PageCollectionE.tsx";
import ProductDetail from "@/pages/product/ProductDetail.tsx";
import RouteGuest from "./RouteGuest.tsx";
import PageSignup from "@/pages/signup/PageSignup.tsx";
import PageSignin from "@/pages/signin/PageSignin.tsx";
import RouteProtected from "./RouteProtected.tsx";
import Account from "@/pages/user/Account.tsx";
import Checkout from "@/pages/user/Checkout.tsx";
import Orders from "@/pages/user/Orders.tsx";
import OrderDetail from "@/pages/user/OrderDetail.tsx";

import LayoutAdmin from "@/layouts/admin/LayoutAdmin.tsx";
import RouteAdmin from "./RouteAdmin.tsx";
import Dashboard from "@/pages/admin/dashboard/Dashboard.tsx";
import Products from "@/pages/admin/products/Products.tsx";
import ProductAdd from "@/pages/admin/products/ProductAdd.tsx";
import ProductEdit from "@/pages/admin/products/ProductEdit.tsx";
import OrdersAdmin from "@/pages/admin/orders/OrdersAdmin.tsx";
import OrderDetailAdmin from "@/pages/admin/orders/OrderDetailAdmin.tsx";
import Subscribers from "@/pages/admin/subscribers/Subscribers.tsx";
import Messages from "@/pages/admin/messages/Contacts.tsx";

const AppRoutes = () => {
  return (
    <>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ScrollToTop />
        <Routes>
          {/* LayoutAdmin */}
          <Route element={<LayoutMain />}>
            <Route path="*" element={<Page404 />} />
            <Route path="/" element={<PageHome />} />
            <Route path="/about" element={<PageAbout />} />
            <Route path="/contact" element={<PageContact />} />
            <Route path="/search" element={<ProductSearch />} />
            <Route path="/products/a" element={<PageCollectionA />} />
            <Route path="/products/b" element={<PageCollectionB />} />
            <Route path="/products/c" element={<PageCollectionC />} />
            <Route path="/products/d" element={<PageCollectionD />} />
            <Route path="/products/e" element={<PageCollectionE />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            {/* RouteGuest */}
            <Route element={<RouteGuest />}>
              <Route path="/signup" element={<PageSignup />} />
              <Route path="/signin" element={<PageSignin />} />
            </Route>
            {/* ProtectedRoute */}
            <Route path="/user" element={<RouteProtected />}>
              <Route path="account" element={<Account />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
            </Route>
          </Route>

          {/* LayoutAdmin */}
          <Route element={<LayoutAdmin />}>
            {/* RouteAdmin */}
            <Route path="/admin" element={<RouteAdmin />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="products/new" element={<ProductAdd />} />
              <Route path="products/:id/edit" element={<ProductEdit />} />
              <Route path="orders" element={<OrdersAdmin />} />
              <Route path="orders/:id" element={<OrderDetailAdmin />} />
              <Route path="subscribers" element={<Subscribers />} />
              <Route path="messages" element={<Messages />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default AppRoutes;
