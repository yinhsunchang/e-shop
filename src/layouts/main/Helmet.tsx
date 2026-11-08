import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import "@/i18n/i18n";

const MyHelmet = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t("pageTitle");
  }, [t, i18n.language]);

  return (
    <div>
      <Helmet>
        <title>{t("pageTitle")}</title>
        <meta name="description" content={t("pageDescription")} />
      </Helmet>
    </div>
  );
};

export default MyHelmet;
