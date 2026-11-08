import ProductCollection from "@/pages/product/ProductCollection";
import { useTranslation } from "react-i18next";

export default function CollectionC() {
  const { t } = useTranslation();

  return <ProductCollection categoryId={3} title={t("category.titleC")} />;
}
