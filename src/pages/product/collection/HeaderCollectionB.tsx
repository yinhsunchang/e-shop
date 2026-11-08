import { useTranslation } from "react-i18next";
import zorro from "@/assets/zorro.jpg";

const HeaderAbout = () => {
  const { t } = useTranslation();

  return (
    <header
      className="bgimg display-container"
      style={{ backgroundImage: `url(${zorro})`, marginTop: "48px" }}
    >
      <div className="display-middle">
        <span
          className="xxxlarge wide light-grey text-dark-grey animate-fading"
          style={{ fontFamily: "Cinzel" }}
        >
          {t("category.headerB1")}
          <br />
          {t("category.headerB2")}
        </span>
      </div>
    </header>
  );
};

export default HeaderAbout;
