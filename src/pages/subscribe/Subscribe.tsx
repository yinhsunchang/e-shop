import { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "./Modal";
import SubscribeForm from "./SubscribeForm";

const Subscribe = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="button black"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {t("footer.about.subscribe")}
      </button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <div
          className="padding-large black"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1 className="xlarge">{t("subscribe.title")}</h1>

          <button
            type="button"
            aria-label={t("subscribe.close")}
            className="button"
            onClick={() => setOpen(false)}
          >
            <i className="fa fa-times xlarge" aria-hidden="true" />
          </button>
        </div>

        <div className="container white padding margin">
          <SubscribeForm />
        </div>
      </Modal>
    </>
  );
};

export default Subscribe;
