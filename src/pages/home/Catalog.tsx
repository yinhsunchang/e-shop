import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal.tsx";
import xmas from "@/assets/xmas.jpg";
import zorro from "@/assets/zorro.jpg";
import reading from "@/assets/reading.jpg";
import eating from "@/assets/eating.jpg";
import playing from "@/assets/playing.jpg";

interface CatalogCardProps {
  image: string;
  title: string;
  path: string;
  description: string;
  reverse?: boolean;
}

const CatalogCard = ({
  image,
  title,
  path,
  description,
  reverse = false,
}: CatalogCardProps) => {
  return (
    <div className="row margin">
      <div className={`threequarter ${reverse ? "right" : ""}`}>
        <Link to={path}>
          <img
            src={image}
            style={{
              width: "100%",
              minHeight: "200px",
              aspectRatio: "4/3",
              objectFit: "cover",
            }}
            alt={title}
          />
        </Link>
      </div>

      <div className="quarter container">
        <Link to={path}>
          <h2 className="large">{title}</h2>
        </Link>
        <p>{description}</p>
      </div>
    </div>
  );
};

const Catalog = () => {
  const { t } = useTranslation();

  const cards = [
    {
      id: "a",
      image: xmas,
      title: t("category.titleA"),
      path: "/products/a",
      description: t("category.descriptionA"),
    },
    {
      id: "b",
      image: zorro,
      title: t("category.titleB"),
      path: "/products/b",
      description: t("category.descriptionB"),
      reverse: true,
    },
    {
      id: "c",
      image: reading,
      title: t("category.titleC"),
      path: "/products/c",
      description: t("category.descriptionC"),
    },
    {
      id: "d",
      image: eating,
      title: t("category.titleD"),
      path: "/products/d",
      description: t("category.descriptionD"),
      reverse: true,
    },
    {
      id: "e",
      image: playing,
      title: t("category.titleE"),
      path: "/products/e",
      description: t("category.descriptionE"),
    },
  ];

  return (
    <div className="justify text-grey">
      <div className="container center">
        <h1 className="xlarge">{t("category.title")}</h1>
      </div>

      <div className="">
        {cards.map((card) => (
          <Reveal key={card.title}>
            <CatalogCard
              image={card.image}
              title={card.title}
              path={card.path}
              description={card.description}
              reverse={card.reverse}
            />
          </Reveal>
        ))}
      </div>
    </div>
  );
};

export default Catalog;
