import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

function Typing() {
  const { t } = useTranslation();

  const [messageIndex, setMessageIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [text, setText] = useState("");

  const MESSAGES = useMemo(
    () => [t("promobar.text1"), t("promobar.text2")],
    [t]
  );

  useEffect(() => {
    const current = MESSAGES[messageIndex];

    let timeout: ReturnType<typeof setTimeout>;

    if (charIndex <= current.length) {
      timeout = setTimeout(() => {
        setText(current.substring(0, charIndex));
        setCharIndex((prev) => prev + 1);
      }, 100);
    } else {
      timeout = setTimeout(() => {
        setCharIndex(0);
        setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
      }, 1500);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, messageIndex, MESSAGES]);

  return <div style={{ minHeight: "1.5em" }}>{text}</div>;
}

const PromoBar = () => {
  return (
    <>
      <div
        className="black text-white small"
        style={{
          position: "relative",
          marginTop: "48px",
          height: "38px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          letterSpacing: "0.15em",
          // textTransform: "uppercase"
        }}
      >
        <Typing />
      </div>
    </>
  );
};

export default PromoBar;
