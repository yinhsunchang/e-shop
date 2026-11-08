import "@/pages/user/Orders.css";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { OrderProps } from "@/types/order";

const statusTranslations: Record<string, string> = {
  pending: "orders.status.pending",
  paid: "orders.status.paid",
  cancelled: "orders.status.cancelled",
  shipped: "orders.status.shipped",
  completed: "orders.status.completed",
};

function OrdersAdmin() {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState<OrderProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        style: "currency",
        currency: "EUR",
      }),
    [i18n.language]
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [i18n.language]
  );

  useEffect(() => {
    let ignore = false;

    async function fetchOrders() {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (ignore) return;

      if (fetchError) {
        console.error(fetchError);
        setError(t("ordersAdmin.fetchError"));
        setLoading(false);
        return;
      }

      setOrders(data ?? []);
      setLoading(false);
    }

    fetchOrders();

    return () => {
      ignore = true;
    };
  }, [t]);

  if (loading) {
    return (
      <div role="status" className="padding-64 center">
        <h1 className="xlarge">{t("ordersAdmin.title")}</h1>
        <p>{t("loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="padding-64 center">
        <h1 className="xlarge">{t("ordersAdmin.title")}</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1 className="xlarge">{t("ordersAdmin.title")}</h1>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <p>{t("ordersAdmin.noOrder")}</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article key={order.id} className="order-card">
              <div className="order-header">
                <h2 className="large">
                  {t("ordersAdmin.order")} #{order.id}
                </h2>
                <span
                  className={`order-status status-${order.status.toLowerCase()}`}
                >
                  {t(
                    statusTranslations[order.status] ?? "orders.status.unknown"
                  )}
                </span>
              </div>

              <div className="order-info">
                <p>
                  <span>{t("ordersAdmin.total")}</span>
                  {priceFormatter.format(order.total)}
                </p>
                <p>
                  <span>{t("orders.date")}</span>
                  {dateFormatter.format(new Date(order.created_at))}
                </p>
              </div>

              <Link
                to={`/admin/orders/${order.id}`}
                className="view-order-link button black round-large right"
              >
                {t("ordersAdmin.orderLink")}
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrdersAdmin;
