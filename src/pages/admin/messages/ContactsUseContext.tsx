import "./Contacts.css";
import { useState } from "react";
import { useContacts } from "./useContacts";
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

function Contacts() {
  const { t } = useTranslation();

  const { contacts, loading, deleteContact } = useContacts();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: number) => {
    try {
      setError(null);
      setDeletingId(id);
      await deleteContact(id);
    } catch {
      setError(t("messages.deleteFailed"));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div role="status" className="padding-64 center">
        <p>{t("loading")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="contacts-page">
        <h1 className="xlarge">{t("contacts.title")}</h1>

        {error && (
          <p className="margin padding large black round-large" role="alert">
            {error}
          </p>
        )}

        {contacts.length === 0 ? (
          <div className="empty-contacts">
            <p>{t("contacts.empty")}</p>
          </div>
        ) : (
          <div className="contacts-list">
            {contacts.map((contact) => (
              <article key={contact.id} className="contact-card">
                <div className="contact-header">
                  <h2 className="large">
                    {t("contacts.name")}
                    {contact.name}
                  </h2>

                  <p>
                    <small>{formatDate(contact.created_at)}</small>
                  </p>
                </div>

                <div className="contact-info">
                  <p>
                    <span>Email: </span>
                    {contact.email}
                  </p>
                  <p>
                    <span>Subject: </span>
                    {contact.subject}
                  </p>
                  <p>
                    <span>Message: </span>
                    {contact.message}
                  </p>
                </div>

                <button
                  type="button"
                  className="button black margin-top round-large right"
                  onClick={() => handleDelete(contact.id)}
                  disabled={deletingId === contact.id}
                >
                  <i className="fa fa-trash" aria-hidden="true"></i>{" "}
                  {deletingId === contact.id
                    ? t("contacts.deleting")
                    : t("contacts.delete")}
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Contacts;
