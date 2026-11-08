import { useTranslation } from "react-i18next";

function Switcher() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    document.documentElement.lang = lng;
  };

  return (
    <>
      <div
        className="button center"
        title={t("nav.en")}
        onClick={() => changeLanguage("en")}
      >
        🇬🇧
      </div>
      <div
        className="button center"
        title={t("nav.fr")}
        onClick={() => changeLanguage("fr")}
      >
        🇫🇷
      </div>
    </>
  );
}

export default Switcher;
