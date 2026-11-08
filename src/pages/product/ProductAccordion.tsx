import { useTranslation } from "react-i18next";
import { useState } from "react";

type Section = "payment" | "shipping" | "return";

interface AccordionCardProps {
  id: Section;
  title: string;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
  borderBottom?: boolean;
}

function AccordionCard({
  id,
  title,
  isOpen,
  onClick,
  children,
  borderBottom = false,
}: AccordionCardProps) {
  return (
    <div className={borderBottom ? "border-bottom" : ""}>
      <button
        id={`${id}-button`}
        type="button"
        onClick={onClick}
        className="button border-top small block"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          letterSpacing: "0.15em",
        }}
        aria-expanded={isOpen}
        aria-controls={`${id}-content`}
      >
        {title}
        <span
          className="large"
          style={{ fontWeight: "300" }}
          aria-hidden="true"
        >
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {/* {isOpen && children} */}
      <div
        id={`${id}-content`}
        aria-labelledby={`${id}-button`}
        hidden={!isOpen}
      >
        {children}
      </div>
    </div>
  );
}

function Accordion() {
  const { t } = useTranslation();
  const [openSection, setOpenSection] = useState<Section | null>(null);
  const toggleSection = (section: Section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  return (
    <div className="text-gray">
      <AccordionCard
        id="payment"
        title={t("product.accordion.title1")}
        isOpen={openSection === "payment"}
        onClick={() => toggleSection("payment")}
      >
        <div className="container">
          <p>{t("product.accordion.text1")}</p>
        </div>
      </AccordionCard>

      <AccordionCard
        id="shipping"
        title={t("product.accordion.title2")}
        isOpen={openSection === "shipping"}
        onClick={() => toggleSection("shipping")}
      >
        <div className="container">
          <p>{t("product.accordion.text2")}</p>
        </div>
      </AccordionCard>

      <AccordionCard
        id="return"
        title={t("product.accordion.title3")}
        isOpen={openSection === "return"}
        onClick={() => toggleSection("return")}
        borderBottom
      >
        <div className="container">
          <p>{t("product.accordion.text3")}</p>
        </div>
      </AccordionCard>
    </div>
  );
}

export default Accordion;
