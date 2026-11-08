import { useTranslation } from "react-i18next";
import oops from "@/assets/oops.jpg";

const Header404 = () => {
  const { t } = useTranslation();

  return (
    <header
      className="bgimg display-container"
      style={{ backgroundImage: `url(${oops})` }}
    >
      <div style={{ position: "absolute", right: 0, bottom: 100 }}>
        <h1 className="xxlarge white wide padding animate-left">
          {t("404.title")}
        </h1>
        <p className="xlarge white wide padding animate-right">
          {t("404.text")}
        </p>
      </div>
    </header>
  );
};

export default Header404;
