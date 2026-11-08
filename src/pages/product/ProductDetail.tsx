import "./ProductDetail.css";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "@/cart/useCart.ts";
import { supabase } from "@/lib/supabase.ts";
import ProductAccordion from "./ProductAccordion.tsx";
import type { ProductProps } from "@/types/product.ts";

export default function ProductDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [product, setProduct] = useState<ProductProps | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        style: "currency",
        currency: "EUR",
      }),
    [i18n.language]
  );

  // Fetch product
  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      if (!id) {
        setProduct(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setProduct(null);
      setQuantity(1);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (cancelled) return;

      if (error) {
        console.error(error);
        setProduct(null);
      } else {
        setProduct(data);
      }
      setLoading(false);
    }

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Quantity handlers
  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    if (!product) return;
    setQuantity((current) => Math.min(product.stock, current + 1));
  };

  // Add to cart
  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;

    const result = addToCart(product, quantity);

    if (result.success) {
      setQuantity(1);
    } else {
      console.error(result.message);
    }
  };

  if (loading) {
    return <div className="padding-64 center">{t("loading")}</div>;
  }

  if (!product) {
    return (
      <div className="padding-64 center" role="alert">
        {t("product.noProduct")}
      </div>
    );
  }

  const isSoldOut = product.stock <= 0;

  return (
    <>
      <div className="content justify text-grey padding-64 margin-top">
        <section className="row margin-top">
          {/* Product Image */}
          <div className="twothird">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                style={{
                  width: "100%",
                  aspectRatio: "1.3/1",
                  objectFit: "cover",
                  padding: "16px",
                }}
              />
            ) : (
              <div
                className="no-product-image"
                style={{
                  width: "100%",
                  height: "100%",
                  aspectRatio: "1.3/1",
                }}
              >
                {t("product.noImage")}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="third container">
            <div>
              <div className="product-info margin-top">
                <h1>{product.name}</h1>

                <p style={{ marginTop: 0 }}>
                  {priceFormatter.format(product.price)}
                </p>
              </div>

              <div className="detail-description">{product.description}</div>

              {/* Stock */}
              <div className="shop-stock-status">
                <span
                  className={
                    isSoldOut ? "stock-indicator sold-out" : "stock-indicator"
                  }
                />
                <span>
                  {isSoldOut
                    ? t("product.add.soldOut")
                    : t("product.inStock", "In stock")}
                </span>
              </div>

              {/* Quantity */}
              <div className="option-block light-gray padding margin-top round-large">
                <div className="option-header">
                  <span>{t("product.quantity")}</span>
                </div>

                <div className="quantity" style={{ width: "100%" }}>
                  <button
                    type="button"
                    className="button white round-large"
                    onClick={decreaseQuantity}
                    disabled={isSoldOut || quantity <= 1}
                    aria-label={t("product.decreaseQuantity")}
                  >
                    −
                  </button>

                  <span aria-live="polite">{quantity}</span>

                  <button
                    type="button"
                    className="button white round-large"
                    onClick={increaseQuantity}
                    disabled={isSoldOut || quantity >= product.stock}
                    aria-label={t("product.increaseQuantity")}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to cart */}
              <button
                type="button"
                className={"button black round-large block"}
                disabled={isSoldOut}
                onClick={handleAddToCart}
              >
                {isSoldOut ? t("product.add.soldOut") : t("product.add.add")}
              </button>
            </div>
          </div>
        </section>

        {/* Product Accordion */}
        <section className="margin">
          <ProductAccordion />
        </section>
      </div>
    </>
  );
}
