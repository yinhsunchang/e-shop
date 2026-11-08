import { useTranslation } from "react-i18next";
import ContactForm from "./ContactForm";

const Contact = () => {
  const { t } = useTranslation();

  return (
    <div className="content text-dark-gray padding-32" id="contact">
      <h1 className="xlarge">{t("contact.title")}</h1>
      <hr style={{ width: "200px" }} className="opacity" />
      <div className="section">
        <p>
          <i
            className="fa fa-map-marker fa-fw large margin-right"
            aria-hidden="true"
          ></i>
          {t("contact.address")}
        </p>
        <p>
          <i
            className="fa fa-phone fa-fw large margin-right"
            aria-hidden="true"
          ></i>
          {t("contact.phone")}
        </p>
        <p>
          <i
            className="fa fa-envelope fa-fw large margin-right"
            aria-hidden="true"
          ></i>
          {t("contact.email")}
        </p>
      </div>

      <div className="padding-32">
        <ContactForm />
      </div>
    </div>
  );
};

export default Contact;
