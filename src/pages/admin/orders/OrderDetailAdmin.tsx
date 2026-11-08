import "./OrderDetailAdmin.css";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

const statusOptions: Record<string, string[]> = {
  pending: ["pending", "cancelled"],
  paid: ["paid", "shipped"],
  shipped: ["shipped", "completed"],
  completed: ["completed"],
  cancelled: ["cancelled"],
};

function OrderDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderProps | null>(null);
  const [items, setItems] = useState<OrderItemProps[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        setError(t("orderDetailAdmin.noId"));
        setLoading(false);
        return;
      }

      // Get Order
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

        // Get Order Items
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
          setStatus(orderData.status);
        }
      } catch (error) {
        console.error("Fetch order error:", error);

        if (!cancelled) {
          setError(t("orderDetailAdmin.fetchError"));
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

  async function handleStatusUpdate() {
    if (!order) return;

    const { error } = await supabase
      .from("orders")
      .update({
        status,
      })
      .eq("id", order.id);

    if (error) {
      console.error(error);
      return;
    }

    navigate("/admin/orders");
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
      <div className="padding-64 center">
        <h1 className="xlarge">{t("orderDetailAdmin.notFound")}</h1>
        <p>{error || t("orderDetailAdmin.notFoundP")}</p>
        <Link to="/admin/orders">{t("orderDetailAdmin.back")}</Link>
      </div>
    );
  }

  return (
    <div className="admin-order-page">
      {/* Back button */}
      <p>
        <Link to="/admin/orders" className="button">
          {t("orderDetailAdmin.back")}
        </Link>
      </p>

      {/* Order title */}
      <h1 className="xlarge margin-bottom" aria-label={t("orderDetail.title")}>
        {t("orderDetail.title")} #{order.id}
      </h1>

      <p className="center">
        <span>{t("orderDetail.created")}: </span>
        {dateFormatter.format(new Date(order.created_at))}
      </p>

      {/* Order information */}
      <section className="admin-order-summary">
        <div className="admin-summary-item">
          <span>{t("orderDetailAdmin.customer")}</span>
          <strong>{order.user_id}</strong>
        </div>

        <div className="admin-summary-item">
          <span>{t("orderDetail.total")}</span>
          <strong>{priceFormatter.format(order.total)}</strong>
        </div>
      </section>

      <section className="order-items-section">
        <h2 className="center">{t("orderDetail.items")}</h2>

        <div className="admin-order-items">
          {items.map((item) => (
            <article className="admin-order-item" key={item.id}>
              <div className="item-details">
                <h3>{item.product_name}</h3>
                <p>
                  {priceFormatter.format(item.price)}
                  {" × "}
                  {item.quantity}
                </p>
              </div>

              <div className="item-subtotal">
                <span>{t("orderDetail.subtotal")}</span>
                <strong>{priceFormatter.format(item.subtotal)}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="status-section">
        <div>
          <h2>{t("orderDetail.status")}</h2>
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
        </div>

        <div className="status-controls">
          {/* <label htmlFor="order-status">{t("orderDetail.status")}</label> */}
          <select
            // id="order-status"
            className="status-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {statusOptions[order.status].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="button black small margin-top round-large"
            onClick={handleStatusUpdate}
          >
            {t("orderDetailAdmin.save")}
          </button>
        </div>
      </section>
    </div>
  );
}

export default OrderDetail;
