import ProductCollection from "@/pages/product/ProductCollection";
import { useTranslation } from "react-i18next";

export default function CollectionA() {
  const { t } = useTranslation();

  return <ProductCollection categoryId={1} title={t("category.titleA")} />;
}
