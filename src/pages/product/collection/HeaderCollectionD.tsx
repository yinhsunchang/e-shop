import { useTranslation } from "react-i18next";
import eating from "@/assets/eating.jpg";

const HeaderAbout = () => {
  const { t } = useTranslation();

  return (
    <header
      className="bgimg display-container"
      style={{ backgroundImage: `url(${eating})`, marginTop: "48px" }}
    >
      <div className="display-middle">
        <span
          className="xxxlarge wide light-grey text-dark-grey animate-fading"
          style={{ fontFamily: "Cinzel" }}
        >
          {t("category.headerD1")}
          <br />
          {t("category.headerD2")}
        </span>
      </div>
    </header>
  );
};

export default HeaderAbout;
