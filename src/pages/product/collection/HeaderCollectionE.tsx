import { useTranslation } from "react-i18next";
import playing from "@/assets/playing.jpg";

const HeaderAbout = () => {
  const { t } = useTranslation();

  return (
    <header
      className="bgimg display-container"
      style={{ backgroundImage: `url(${playing})`, marginTop: "48px" }}
    >
      <div className="display-middle">
        <span
          className="xxxlarge wide light-grey text-dark-grey animate-fading"
          style={{ fontFamily: "Cinzel" }}
        >
          {t("category.headerE1")}
          <br />
          {t("category.headerE2")}
        </span>
      </div>
    </header>
  );
};

export default HeaderAbout;
