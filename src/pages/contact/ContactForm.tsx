import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { sendContactForm } from "@/services/sendContactForm";
import type { ContactFormProps } from "@/types/contact";

interface StatusProps {
  success: boolean;
  message: string;
}

const INITIAL_FORM: ContactFormProps = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const ContactForm = () => {
  const { t } = useTranslation();

  const [status, setStatus] = useState<StatusProps | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [form, setForm] = useState<ContactFormProps>(INITIAL_FORM);

  // Prevent duplicate submissions before React updates the UI.
  const submittingRef = useRef(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (submittingRef.current) return;

    submittingRef.current = true;
    setLoading(true);
    setStatus(null);

    try {
      await sendContactForm(form);
      setStatus({ success: true, message: t("contact.success") });
      setForm(INITIAL_FORM);
    } catch (error) {
      console.error("Failed to send contact form:", error);
      setStatus({ success: false, message: t("contact.fail") });
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <>
      <section>
        <p>{t("contact.sendMessage")}</p>

        <form onSubmit={handleSubmit} aria-busy={loading}>
          <div className="margin-bottom">
            <label htmlFor="contact-name">
              {t("contact.placeholder.name")}*
            </label>
            <input
              id="contact-name"
              className="input border"
              type="text"
              name="name"
              autoComplete="name"
              value={form.name}
              placeholder={t("contact.placeholder.name")}
              required
              onChange={handleChange}
            />
          </div>

          <div className="margin-bottom">
            <label htmlFor="contact-email">
              {t("contact.placeholder.email")}*
            </label>
            <input
              id="contact-email"
              className="input border"
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              placeholder={t("contact.placeholder.email")}
              required
              onChange={handleChange}
            />
          </div>

          <div className="margin-bottom">
            <label htmlFor="contact-subject">
              {t("contact.placeholder.subject")}*
            </label>
            <input
              id="contact-subject"
              className="input border"
              type="text"
              name="subject"
              value={form.subject}
              placeholder={t("contact.placeholder.subject")}
              required
              onChange={handleChange}
            />
          </div>

          <div className="margin-bottom">
            <label htmlFor="contact-message">
              {t("contact.placeholder.message")}*
            </label>
            <textarea
              id="contact-message"
              className="input border"
              name="message"
              value={form.message}
              rows={5}
              placeholder={t("contact.placeholder.message")}
              required
              onChange={handleChange}
            />
          </div>

          <button
            className="button black padding-large"
            type="submit"
            disabled={loading}
          >
            <i
              className={`fa ${
                loading ? "fa-refresh fa-spin" : "fa-paper-plane"
              }`}
              aria-hidden="true"
            />{" "}
            {loading ? t("contact.sending") : t("contact.sendButton")}
          </button>
        </form>

        {/* Messages */}
        {status && (
          <div
            className="border center padding margin-top"
            role={status.success ? "status" : "alert"}
            aria-live={status.success ? "polite" : "assertive"}
          >
            <p
              style={{
                color: status.success ? "#166534" : "#b91c1c",
              }}
            >
              {status.message}
            </p>
          </div>
        )}
      </section>
    </>
  );
};

export default ContactForm;
