import { useTranslation } from "react-i18next";
import tunnel from "@/assets/tunnel.jpg";

const HeaderAbout = () => {
  const { t } = useTranslation();

  return (
    <>
      <header
        className="bgimg display-container"
        style={{ backgroundImage: `url(${tunnel})`, marginTop: "48px" }}
      >
        <div className="display-middle">
          <span
            className="xxxlarge wide light-grey text-dark-grey animate-fading"
            style={{ fontFamily: "Cinzel" }}
          >
            {t("about.header1")}
            <br />
            {t("about.header2")}
          </span>
        </div>
      </header>
    </>
  );
};

export default HeaderAbout;
