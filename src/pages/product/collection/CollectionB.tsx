import ProductCollection from "@/pages/product/ProductCollection";
import { useTranslation } from "react-i18next";

export default function CollectionB() {
  const { t } = useTranslation();

  return <ProductCollection categoryId={2} title={t("category.titleB")} />;
}
