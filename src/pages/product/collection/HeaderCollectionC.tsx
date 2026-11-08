import { useTranslation } from "react-i18next";
import reading from "@/assets/reading.jpg";

const HeaderAbout = () => {
  const { t } = useTranslation();

  return (
    <header
      className="bgimg display-container"
      style={{ backgroundImage: `url(${reading})`, marginTop: "48px" }}
    >
      <div className="display-middle">
        <span
          className="xxxlarge wide light-grey text-dark-grey animate-fading"
          style={{ fontFamily: "Cinzel" }}
        >
          {t("category.headerC1")}
          <br />
          {t("category.headerC2")}
        </span>
      </div>
    </header>
  );
};

export default HeaderAbout;
