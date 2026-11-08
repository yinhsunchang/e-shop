import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import xmas from "@/assets/xmas.jpg";
import zorro from "@/assets/zorro.jpg";

interface SlideCardProps {
  image: string;
  alt: string;
  title: string;
  text: string;
  button: string;
  path: string;
}

function SlideCard({ image, alt, title, text, button, path }: SlideCardProps) {
  return (
    <div
      className="display-container"
      style={{
        background: "#222",
        color: "#fff",
        minHeight: "180px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <img src={image} alt={alt} style={{ width: "100%" }} />
      </div>

      <div
        className="display-left black opacity-min hide-small"
        style={{ padding: "24px 48px" }}
      >
        <h1 className="xlarge">{title}</h1>
        <h1 className="large">{text}</h1>
      </div>
      <div className="display-bottomright" style={{ padding: "24px 48px" }}>
        <Link to={path} className="button black padding-large hero-button">
          {button}
        </Link>
      </div>
    </div>
  );
}

export default function Slide() {
  const { t } = useTranslation();

  const slides = [
    {
      id: 1,
      image: xmas,
      alt: "xmas",
      title: t("slide.title1"),
      text: t("slide.text1"),
      button: t("slide.button1"),
      path: "/products/a",
    },
    {
      id: 2,
      image: zorro,
      alt: "zorro",
      title: t("slide.title2"),
      text: t("slide.text2"),
      button: t("slide.button2"),
      path: "/products/b",
    },
  ];

  return (
    <div className="justify text-light-grey">
      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={16}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
      >
        {slides.map((item) => (
          <SwiperSlide key={item.id}>
            <SlideCard
              image={item.image}
              alt={item.alt}
              title={item.title}
              text={item.text}
              button={item.button}
              path={item.path}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
