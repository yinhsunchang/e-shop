import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import curious from "@/assets/curious.jpg";

interface ServiceCardProps {
  image: string;
  title: string;
}
const ServiceCard = ({ image, title }: ServiceCardProps) => {
  return (
    <div className="display-container margin-top">
      <Link to="">
        <img
          src={image}
          alt={title}
          style={{
            display: "block",
            width: "100%",
            minHeight: "200px",
            aspectRatio: "4/3",
            objectFit: "cover",
          }}
          className="card opacity-max"
        />
      </Link>
      <div
        className="display-middle text-dark-gray"
        style={{ padding: "24px 48px", pointerEvents: "none" }}
      >
        <h2 className="large">{title}</h2>
      </div>
    </div>
  );
};

const Service = () => {
  const { t } = useTranslation();

  const cards = [
    {
      id: 1,
      image: curious,
      title: t("service.payment"),
    },
    {
      id: 2,
      image: curious,
      title: t("service.shipment"),
    },
    {
      id: 3,
      image: curious,
      title: t("service.return"),
    },
    {
      id: 4,
      image: curious,
      title: t("service.FAQ"),
    },
    {
      id: 5,
      image: curious,
      title: t("service.help"),
    },
  ];

  return (
    <div className="justify text-grey" id="about">
      <div className="container center">
        <h1 className="xlarge">{t("service.title")}</h1>
      </div>
      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={16}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        // slidesPerView={3}
        breakpoints={{
          0: {
            slidesPerView: 1,
          },
          601: {
            slidesPerView: 2,
          },
          768: {
            slidesPerView: 3,
          },
          993: {
            slidesPerView: 4,
          },
        }}
      >
        {cards.map((item) => (
          <SwiperSlide key={item.id}>
            <ServiceCard image={item.image} title={item.title} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Service;
