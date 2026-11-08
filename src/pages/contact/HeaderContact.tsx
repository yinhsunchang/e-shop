import { useTranslation } from "react-i18next";
import paw from "@/assets/paw.jpg";

const HeaderContact = () => {
  const { t } = useTranslation();

  return (
    <header
      className="bgimg display-container"
      style={{ backgroundImage: `url(${paw})`, marginTop: "48px" }}
    >
      <div className="display-middle">
        <span
          className="xxxlarge wide light-grey text-dark-grey animate-fading"
          style={{ fontFamily: "Cinzel" }}
        >
          {t("contact.header1")}
          <br />
          {t("contact.header2")}
        </span>
      </div>
    </header>
  );
};

export default HeaderContact;
