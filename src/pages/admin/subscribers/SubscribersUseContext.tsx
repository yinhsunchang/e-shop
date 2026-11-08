import "./Subscribers.css";
import { useState } from "react";
import { useSubscribers } from "./useSubscribers";
import type { SubscriberProps } from "@/types/subscribe";
import { useTranslation } from "react-i18next";

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function Subscribers() {
  const { t } = useTranslation();

  const { subscribers, deleteSubscriber } = useSubscribers();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: number) => {
    try {
      setError(null);
      setDeletingId(id);
      await deleteSubscriber(id);
    } catch (error) {
      console.error(error);
      setError(t("subscribers.deleteFailed"));
      alert("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="subscribers-page" style={{ minHeight: "80vh" }}>
        <h1 className="xlarge">{t("subscribers.title")}</h1>

        {error && (
          <p className="margin padding large black round-large" role="alert">
            {error}
          </p>
        )}

        {subscribers.length === 0 ? (
          <div className="empty-subscribers">{t("subscribers.empty")}</div>
        ) : (
          <div className="subscribers-list">
            {subscribers.map((subscriber: SubscriberProps) => (
              <article key={subscriber.id} className="subscriber-card">
                <div className="subscriber-header">
                  <h2 className="large">
                    {t("subscribers.name")}
                    {subscriber.name}
                  </h2>
                  <p>
                    <small>{formatDate(subscriber.created_at)}</small>
                  </p>
                </div>

                <div className="subscriber-info">
                  <p>
                    <span>Email: </span>
                    {subscriber.email}
                  </p>
                </div>

                <button
                  type="button"
                  className="button black margin-top round-large right"
                  onClick={() => handleDelete(subscriber.id)}
                  disabled={deletingId === subscriber.id}
                >
                  <i className="fa fa-trash"></i>{" "}
                  {deletingId === subscriber.id
                    ? t("subscribers.deleting")
                    : t("subscribers.delete")}
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Subscribers;
