import ProductCollection from "@/pages/product/ProductCollection";
import { useTranslation } from "react-i18next";

export default function CollectionD() {
  const { t } = useTranslation();

  return <ProductCollection categoryId={4} title={t("category.titleD")} />;
}
