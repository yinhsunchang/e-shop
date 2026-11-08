import ProductCollection from "@/pages/product/ProductCollection";
import { useTranslation } from "react-i18next";

export default function CollectionE() {
  const { t } = useTranslation();

  return <ProductCollection categoryId={5} title={t("category.titleE")} />;
}
