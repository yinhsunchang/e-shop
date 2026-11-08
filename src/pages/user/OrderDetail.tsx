import "./OrderDetail.css";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { OrderProps, OrderItemProps, OrderStatus } from "@/types/order";
import { isOrderStatus } from "@/types/order";

const statusTranslations: Record<OrderStatus, string> = {
  pending: "orders.status.pending",
  paid: "orders.status.paid",
  cancelled: "orders.status.cancelled",
  shipped: "orders.status.shipped",
  completed: "orders.status.completed",
};

function OrderDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [order, setOrder] = useState<OrderProps | null>(null);
  const [items, setItems] = useState<OrderItemProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Stripe Checkout state
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // Format currency
  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        style: "currency",
        currency: "EUR",
      }),
    [i18n.language]
  );

  // Format date
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [i18n.language]
  );

  // Fetch order details
  useEffect(() => {
    let cancelled = false;

    async function fetchOrder() {
      setLoading(true);
      setError("");
      setOrder(null);
      setItems([]);

      if (!id) {
        setError(t("orderDetail.noId"));
        setLoading(false);
        return;
      }

      try {
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", id)
          .single();

        if (orderError) {
          throw orderError;
        }

        if (cancelled) return;

        const { data: itemData, error: itemError } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", id)
          .order("id", { ascending: true });

        if (itemError) {
          throw itemError;
        }

        if (!cancelled) {
          setOrder(orderData);
          setItems(itemData ?? []);
        }
      } catch (error) {
        console.error("Fetch order error:", error);

        if (!cancelled) {
          setError(t("orderDetail.fetchError"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchOrder();

    return () => {
      cancelled = true;
    };
  }, [id, t]);

  // Create Stripe Checkout Session
  async function handleCheckout() {
    if (!order || checkoutLoading) return;

    setCheckoutLoading(true);
    setCheckoutError("");

    try {
      // Check authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        throw new Error("Please sign in first.");
      }

      // Invoke Supabase Edge Function
      const { data, error: functionError } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: {
            order_id: order.id,
          },
        }
      );

      if (functionError) {
        console.error("Checkout error:", functionError);

        const context = (functionError as { context?: unknown }).context;

        if (context instanceof Response) {
          console.error("HTTP status:", context.status);
          console.error("Response body:", await context.clone().text());
        } else {
          console.error("No HTTP Response context:", context);
        }

        throw functionError;
      }

      console.log("Checkout response:", data);

      if (!data?.url || typeof data.url !== "string") {
        throw new Error("Stripe payment URL not obtained");
      }

      // Redirect to Stripe Checkout
      window.location.assign(data.url);
    } catch (error) {
      console.error("Payment error:", error);

      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Payment failed to be processed, please try again later."
      );
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="padding-64 center">
        <p>{t("loading")}</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <h1 className="xlarge">{t("orderDetail.notFound")}</h1>
        <p>{error || t("orderDetail.notFoundP")}</p>
        <Link to="/user/orders">{t("orderDetail.back")}</Link>
      </div>
    );
  }

  return (
    <div className="order-detail-page margin-top">
      {/* Back button */}
      <p>
        <Link to="/user/orders" className="button round-large">
          {t("orderDetail.back")}
        </Link>
      </p>

      {/* Order title */}
      <h1 className="xlarge center" aria-label={t("orderDetail.title")}>
        {t("orderDetail.title")} #{order.id}
      </h1>

      {/* Order information */}
      <section className="order-meta margin-top">
        <p>
          <span>{t("orderDetail.status")}</span>
          <strong>
            <span
              className={`order-status status-${order.status.toLowerCase()}`}
            >
              {t(
                isOrderStatus(order.status)
                  ? statusTranslations[order.status]
                  : "orders.status.unknown"
              )}
            </span>
          </strong>
        </p>

        <p>
          <span>{t("orderDetail.created")}</span>
          {dateFormatter.format(new Date(order.created_at))}
        </p>
      </section>

      {/* Order items */}
      <section className="order-items-section">
        <h2>{t("orderDetail.items")}</h2>

        {items.length === 0 ? (
          <div className="empty-items">
            <p>{t("orderDetail.noItems")}.</p>
          </div>
        ) : (
          <div className="order-items">
            {items.map((item) => (
              <article key={item.id} className="order-item">
                <div className="item-main">
                  <h3>{item.product_name}</h3>

                  <p>
                    {t("orderDetail.price")}
                    {priceFormatter.format(item.price)}
                  </p>
                  <p>
                    {t("orderDetail.quantity")}
                    {item.quantity}
                  </p>
                </div>

                <div className="item-subtotal">
                  <strong>
                    {t("orderDetail.subtotal")}
                    {priceFormatter.format(item.subtotal)}
                  </strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Order total */}
      <section className="order-total">
        <h2>{t("orderDetail.total")}</h2>
        <strong>{priceFormatter.format(order.total)}</strong>
      </section>

      {/* Stripe Checkout */}
      {order.status.toLowerCase() === "pending" ? (
        <section className="checkout-section">
          <button
            type="button"
            className="button large block round-large status-pending"
            onClick={handleCheckout}
            disabled={checkoutLoading}
            aria-busy={checkoutLoading}
          >
            {checkoutLoading ? t("orderDetail.creating") : t("orderDetail.pay")}
          </button>

          {checkoutError && (
            <p role="alert" className="checkout-error">
              {checkoutError}
            </p>
          )}
        </section>
      ) : (
        <>
          <section className="success-page border round-large">
            <div className="success-box">
              {order.status === "paid" && (
                <div>
                  <i
                    className="fa fa-check success-icon success"
                    aria-hidden="true"
                  ></i>
                  <h2>{t("orderDetail.paid1")}</h2>
                  <p>{t("orderDetail.paid2")}</p>
                </div>
              )}

              {order.status === "cancelled" && (
                <div>
                  <i
                    className="fa fa-close error-icon danger"
                    aria-hidden="true"
                  ></i>
                  <h2>{t("orderDetail.cancelled1")}</h2>
                  <p>{t("orderDetail.cancelled2")}</p>
                </div>
              )}

              {order.status === "shipped" && (
                <div>
                  <i
                    className="fa fa-truck success-icon info"
                    aria-hidden="true"
                  ></i>
                  <h2>{t("orderDetail.shipped1")}</h2>
                  <p>{t("orderDetail.shipped2")}</p>
                </div>
              )}

              {order.status === "completed" && (
                <div>
                  <i
                    className="fa fa-check success-icon white border"
                    aria-hidden="true"
                  ></i>
                  <h2>{t("orderDetail.completed1")}</h2>
                  <p>{t("orderDetail.completed2")}</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default OrderDetail;
