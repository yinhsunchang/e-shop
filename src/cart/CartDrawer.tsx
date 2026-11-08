import "./CartDrawer.css";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo } from "react";
import { useCart } from "./useCart";
import { Link } from "react-router-dom";

export default function CartDrawer() {
  const { t, i18n } = useTranslation();

  const {
    cartItems,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        style: "currency",
        currency: "EUR",
      }),
    [i18n.language]
  );

  useEffect(() => {
    if (!isCartOpen) return;

    // Save original overflow
    const originalOverflow = document.body.style.overflow;

    // Lock background scrolling
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsCartOpen(false);
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      // Restore scrolling
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="cart-overlay"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="cart-drawer cart-open"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        aria-describedby="cart-description"
      >
        {/* Header */}
        <div className="cart-header">
          <h2 id="cart-title">{t("cart.title")}</h2>
          <button
            type="button"
            className="button"
            onClick={() => setIsCartOpen(false)}
            aria-label={t("cart.close")}
          >
            <i className="fa fa-times" aria-hidden="true"></i>
          </button>
        </div>

        {/* Cart Items */}
        <div className="cart-content" id="cart-description">
          {cartItems.length === 0 ? (
            <>
              <p className="empty-cart">{t("cart.empty")}</p>
            </>
          ) : (
            cartItems.map((item) => (
              <div className="cart-item" key={item.id}>
                {/* Product Image */}
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} loading="lazy" />
                ) : (
                  <div className="no-product-image">{t("cart.noImage")}</div>
                )}

                {/* Product Details */}
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">
                    {priceFormatter.format(item.price)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="quantity-control">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label={t("cart.decreaseQuantity")}
                    >
                      −
                    </button>

                    <span aria-live="polite">{item.quantity}</span>

                    <button
                      type="button"
                      disabled={item.quantity >= item.stock}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label={t("cart.increaseQuantity")}
                    >
                      +
                    </button>
                  </div>

                  {/* Remove Product */}
                  <button
                    className="remove-button"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`${t("cart.remove")} ${item.name}`}
                  >
                    {t("cart.remove")}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            {/* Item Subtotal */}
            <div className="subtotal">
              <span>{t("cart.subtotal")}</span>
              <strong>{priceFormatter.format(cartTotal)}</strong>
            </div>

            <p className="cart-note">{t("cart.shipping")}</p>

            <Link
              to="/user/checkout"
              className="cart-checkout-button button black padding-large block"
              onClick={() => setIsCartOpen(false)}
            >
              {t("cart.checkout")}
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
