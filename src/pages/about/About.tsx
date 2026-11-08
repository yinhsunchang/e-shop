import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal.tsx";

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="content text-dark-grey padding-32" id="about">
      <h1 className="xlarge">{t("about.title")}</h1>
      <hr style={{ width: "200px" }} className="opacity" />
      <div>
        <Reveal>
          <section className="padding-large">
            <h2 className="large">{t("about.title1")}</h2>
            <p className="leftbar margin padding">{t("about.text1")}</p>
            <div className="bar">
              <a
                href="https://yinhsunchang.github.io/cat-model-v2"
                target="_blank"
                rel="noopener noreferrer"
                className="bar-item button black padding-large margin-top right mobile"
              >
                {t("about.button1")}
              </a>
            </div>
          </section>
        </Reveal>
        <Reveal>
          <section className="padding-large">
            <h2 className="large">{t("about.title2")}</h2>
            <p className="leftbar margin padding">{t("about.text2")}</p>
            <div className="bar">
              <Link
                to="/"
                className="bar-item button black padding-large margin-top right mobile"
              >
                {t("about.button2")}
              </Link>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
};

export default About;
