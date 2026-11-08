import "./Checkout.css";
import { useTranslation } from "react-i18next";
import { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/cart/useCart";
import useProfile from "./useProfile";

export default function Checkout() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useProfile();

  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } =
    useCart();

  const submittingRef = useRef(false);

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        style: "currency",
        currency: "EUR",
      }),
    [i18n.language]
  );

  async function handlePlaceOrder() {
    if (submittingRef.current || loading || cartItems.length === 0) {
      return;
    }

    // if (profileLoading || !profile?.address) {
    //   setError(t("checkout.addressRequired"));
    //   return;
    // }

    submittingRef.current = true;
    setLoading(true);
    setError("");

    try {
      const items = cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      }));

      const { data, error } = await supabase.rpc("create_order", {
        items,
      });

      if (error) throw error;

      if (!data) {
        throw new Error("Order creation returned no ID");
      }

      clearCart();
      navigate(`/user/orders/${data}`);
    } catch (error) {
      console.error("Create order failed:", error);
      setError(t("checkout.orderError"));
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <h1>{t("checkout.empty")}</h1>
        <button onClick={() => navigate("/")}>{t("checkout.continue")}</button>
      </div>
    );
  }

  return (
    <>
      <div className="checkout-page">
        <div className="content text-dark-grey padding-64">
          <h1 className="xlarge">{t("checkout.title")}</h1>

          {/* Error */}
          {error && (
            <div className="checkout-error" role="alert">
              {error}
            </div>
          )}

          <div className="checkout-container">
            {/* Left：Info */}
            <section>
              <div className="checkout-form card">
                <div className="checkout-address">
                  <h2>{t("checkout.address")}</h2>
                  <button
                    className="button light-gray margin-bottom"
                    disabled={loading}
                  >
                    <i className="fa fa-pencil" aria-hidden="true"></i>{" "}
                    {t("checkout.edit")}
                  </button>
                </div>

                {profileLoading ? (
                  <p role="status">{t("loading")}</p>
                ) : profileError ? (
                  <p role="alert">{profileError}</p>
                ) : (
                  <div className="checkout-card">
                    <p>
                      {t("checkout.name")}:{" "}
                      {profile?.display_name || t("checkout.notSet")}
                    </p>

                    <p>
                      {t("checkout.address")}:{" "}
                      {profile?.address || t("checkout.notSet")}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Right */}
            <section>
              <div className="order-summary card">
                <h2>{t("checkout.items")}</h2>

                {/* Items */}
                {cartItems.map((item) => (
                  <div className="summary-item" key={item.id}>
                    {/* Left: Image */}
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="no-product-image"
                        style={{
                          width: "70px",
                          height: "80px",
                        }}
                      >
                        {t("checkout.noImage")}
                      </div>
                    )}

                    {/* Middle: Info */}
                    <div>
                      <h3>{item.name}</h3>
                      {/* Quantity */}
                      <div className="checkout-quantity-control">
                        <button
                          type="button"
                          className="button"
                          disabled={loading}
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          aria-label={`${t("checkout.decreaseQuantity")} ${
                            item.name
                          }`}
                        >
                          −
                        </button>

                        <span
                          className="medium text-black"
                          aria-live="polite"
                          aria-atomic="true"
                        >
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          className="button"
                          disabled={loading || item.quantity >= item.stock}
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          aria-label={`${t("checkout.increaseQuantity")} ${
                            item.name
                          }`}
                        >
                          +
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        className="checkout-remove-button"
                        disabled={loading}
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`${t("checkout.remove")} ${item.name}`}
                      >
                        {t("checkout.remove")}
                      </button>
                    </div>

                    {/* Right: Subtotal */}
                    <strong>
                      {priceFormatter.format(item.price * item.quantity)}
                    </strong>
                  </div>
                ))}

                {/* Total */}
                <div className="summary-total">
                  <span>{t("checkout.total")}</span>
                  <strong>{priceFormatter.format(cartTotal)}</strong>
                </div>

                {/* Place Order */}
                <button
                  type="button"
                  className="button block black padding-large margin-top"
                  onClick={handlePlaceOrder}
                  disabled={
                    loading ||
                    profileLoading ||
                    !!profileError ||
                    // !profile?.address ||
                    cartItems.length === 0
                  }
                  aria-busy={loading}
                >
                  {loading ? t("checkout.creating") : t("checkout.place")}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
