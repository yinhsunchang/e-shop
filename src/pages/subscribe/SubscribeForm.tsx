import { useState } from "react";
import { sendSubscribeForm } from "@/services/sendSubscribeForm";
import type { SubscribeFormProps } from "@/types/subscribe";
import { useTranslation } from "react-i18next";

const SubscribeForm = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<SubscribeFormProps>({
    name: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await sendSubscribeForm(form);
      setSuccess(t("subscribe.success"));
      setForm({ name: "", email: "" });
    } catch (err) {
      console.error(err);
      setError(t("subscribe.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">{t("subscribe.name")}*</label>
          <input
            id="name"
            className="input padding-16 border margin-bottom"
            type="text"
            name="name"
            aria-label="name"
            value={form.name}
            placeholder={t("subscribe.name")}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div>
          <label htmlFor="email">Email*</label>
          <input
            id="email"
            className="input padding-16 border"
            type="email"
            name="email"
            aria-label="email"
            value={form.email}
            placeholder="Email"
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="center margin-bottom">
          {success && <p style={{ color: "black" }}>{success}</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>

        <p>
          <button
            className="button black block padding-16"
            type="submit"
            disabled={loading}
          >
            <i
              className={`fa ${
                loading ? "fa-refresh fa-spin" : "fa-paper-plane"
              }`}
              aria-hidden="true"
            />{" "}
            {loading ? t("subscribe.sending") : t("subscribe.send")}
          </button>
        </p>
      </form>
    </>
  );
};

export default SubscribeForm;
