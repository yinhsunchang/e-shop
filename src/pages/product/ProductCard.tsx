import "./ProductCard.css";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useCart } from "@/cart/useCart";
import { Link } from "react-router-dom";
import type { ProductProps } from "@/types/product";

interface ProductCardProps {
  product: ProductProps;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const isSoldOut = (product.stock ?? 0) <= 0;
  const productUrl = `/products/${product.id}`;

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        style: "currency",
        currency: "EUR",
      }),
    [i18n.language]
  );

  return (
    <article className="product-card">
      <div className="display-container" style={{ overflow: "hidden" }}>
        <Link
          to={productUrl}
          className="product-image-link"
          aria-label={product.name}
        >
          <div className="product-image">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="no-product-image">{t("product.noImage")}</div>
            )}
          </div>
        </Link>

        {isSoldOut && (
          <span className="sold-out">{t("product.add.soldOut")}</span>
        )}
      </div>

      <div className="text-dark-gray padding-small">
        <Link to={productUrl}>
          <h3 className="large">{product.name}</h3>
        </Link>
        <p style={{ marginTop: 0 }}>{priceFormatter.format(product.price)}</p>
      </div>

      {/* Add to Cart */}
      <div>
        <button
          type="button"
          className="button black block"
          disabled={isSoldOut}
          onClick={() => addToCart(product)}
          aria-label={`${t(
            isSoldOut ? "product.add.soldOut" : "product.add.add"
          )}: ${product.name}`}
        >
          {isSoldOut ? t("product.add.soldOut") : t("product.add.add")}
        </button>
      </div>
    </article>
  );
}
