import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./auth/AuthProvider";
import { CartProvider } from "./cart/CartProvider.tsx";
import Routes from "./routes/Routes.tsx";
import "./App.css";

function App() {
  return (
    <>
      <HelmetProvider>
        <AuthProvider>
          <CartProvider>
            <Routes />
          </CartProvider>
        </AuthProvider>
      </HelmetProvider>
    </>
  );
}

export default App;
