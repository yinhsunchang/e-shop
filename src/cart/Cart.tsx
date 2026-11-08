import { useTranslation } from "react-i18next";
import { useCart } from "./useCart.ts";

export default function Cart() {
  const { t } = useTranslation();
  const { cartCount, setIsCartOpen } = useCart();

  return (
    <button
      type="button"
      className="button"
      onClick={() => setIsCartOpen(true)}
      aria-label={t("cart.open")}
    >
      <i className="fa fa-shopping-cart medium" aria-hidden="true"></i>
      {cartCount > 0 && (
        <span className="badge right tiny">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      )}
    </button>
  );
}
