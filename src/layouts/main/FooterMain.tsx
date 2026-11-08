import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Subscribe from "@/pages/subscribe/Subscribe.tsx";

const FooterMain = () => {
  const { t } = useTranslation();

  return (
    <>
      <footer>
        <section
          id="footer"
          className="grid light-grey text-gray small center padding-16"
          style={{
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: "16px",
          }}
        >
          {/* About */}
          <div className="mobile">
            <h4 className="medium text-dark-gray">
              ｜{t("footer.about.title")}｜
            </h4>
            <p>
              <Link to="/about" className="hover-opacity">
                {t("footer.about.about")}
              </Link>
            </p>
            <p className="hover-opacity">
              <Subscribe />
            </p>
            <a
              href="https://www.instagram.com/docteur.2022/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa fa-instagram margin-right hover-opacity"></i>
            </a>
            <i className="fa fa-facebook-official hover-opacity margin-right"></i>
            <i className="fa fa-pinterest-p hover-opacity margin-right"></i>
            <i className="fa fa-twitter hover-opacity margin-right"></i>
            <i className="fa fa-snapchat hover-opacity"></i>
          </div>

          {/* Service */}
          <div className="mobile">
            <h4 className="medium text-dark-gray">
              ｜{t("footer.service.title")}｜
            </h4>
            <p>
              <Link to="">{t("footer.service.payment")}</Link>
            </p>
            <p>
              <Link to="">{t("footer.service.shipment")}</Link>
            </p>
            <p>
              <Link to="">{t("footer.service.return")}</Link>
            </p>
            <p>
              <Link to="">{t("footer.service.FAQ")}</Link>
            </p>
          </div>

          {/* Contact */}
          <div className="mobile">
            <h4 className="medium text-dark-gray">
              ｜{t("footer.contact.title")}｜
            </h4>
            <p>
              <i className="fa fa-fw fa-map-marker" aria-hidden="true"></i>{" "}
              Paris, France
            </p>
            <p>
              <i className="fa fa-fw fa-phone" aria-hidden="true"></i>{" "}
              +33123123123
            </p>
            <p>
              <i className="fa fa-fw fa-envelope" aria-hidden="true"></i>{" "}
              hello@style-d.com
            </p>
          </div>

          {/* Payment */}
          <div>
            <h4 className="medium text-dark-gray">
              ｜{t("footer.accept.title")}｜
            </h4>
            <div aria-label="Accepted payment methods">
              <i className="fa fa-credit-card margin-right"></i>
              <i className="fa fa-cc-mastercard margin-right"></i>
              <i className="fa fa-cc-amex margin-right"></i>
              <i className="fa fa-cc-visa margin-right"></i>
              <i className="fa fa-cc-paypal"></i>
            </div>
          </div>
        </section>

        {/* Copyright */}
        <section>
          <p className="text-grey medium center">
            Designed & Built by
            <a
              href="https://github.com/yinhsunchang"
              target="_blank"
              rel="noopener noreferrer"
              className="hover-opacity"
            >
              {" "}
              Yin-Hsun Chang
            </a>
          </p>
        </section>
      </footer>
    </>
  );
};

export default FooterMain;
