import { useTranslation } from "react-i18next";
import xmas from "@/assets/xmas.jpg";

const HeaderAbout = () => {
  const { t } = useTranslation();

  return (
    <header
      className="bgimg display-container"
      style={{ backgroundImage: `url(${xmas})`, marginTop: "48px" }}
    >
      <div className="display-middle">
        <span
          className="xxxlarge wide light-grey text-dark-grey animate-fading"
          style={{ fontFamily: "Cinzel" }}
        >
          {t("category.headerA1")}
          <br />
          {t("category.headerA2")}
        </span>
      </div>
    </header>
  );
};

export default HeaderAbout;
