import "./ProductAdd.css";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { CategoryProps } from "@/types/category";

function ProductAddForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchCategories() {
      try {
        setLoadingCategories(true);

        const { data, error } = await supabase
          .from("categories")
          .select("id, name, slug")
          .order("name", { ascending: true });

        if (error) throw error;

        if (isMounted) {
          setCategories(data ?? []);
        }
      } catch (error) {
        console.error("FETCH CATEGORIES ERROR:", error);

        if (isMounted) {
          setError(t("productAdd.error.fetchCategories"));
        }
      } finally {
        if (isMounted) {
          setLoadingCategories(false);
        }
      }
    }

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [t]);

  async function uploadProductImage(
    image: File
  ): Promise<{ publicUrl: string; filePath: string }> {
    const fileExt = image.name.split(".").pop()?.toLowerCase();

    if (!fileExt) {
      throw new Error(t("productAdd.validation.fileExt"));
    }

    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, image, {
        contentType: image.type,
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return {
      publicUrl: data.publicUrl,
      filePath,
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    /* Validation */
    if (!name.trim()) {
      setError(t("productAdd.validation.name"));
      return;
    }

    if (!categoryId) {
      setError(t("productAdd.validation.categoryId"));
      return;
    }

    const parsedPrice = Number(price);

    if (
      price.trim() === "" ||
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0 ||
      !/^\d+(\.\d{1,2})?$/.test(price)
    ) {
      setError(t("productAdd.validation.price"));
      return;
    }

    const parsedStock = Number(stock);

    if (
      stock.trim() === "" ||
      !Number.isInteger(parsedStock) ||
      parsedStock < 0
    ) {
      setError(t("productAdd.validation.stock"));
      return;
    }

    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

    if (!image) {
      setError(t("productAdd.validation.image"));
      return;
    }

    if (!ALLOWED_TYPES.includes(image.type)) {
      setError(t("productAdd.validation.imageType"));
      return;
    }

    if (image.size > 5 * 1024 * 1024) {
      setError(t("productAdd.validation.imageSize"));
      return;
    }

    let uploadedFilePath: string | null = null;

    try {
      setLoading(true);

      const uploadedImage = await uploadProductImage(image);
      uploadedFilePath = uploadedImage.filePath;

      /* Insert product into database */
      const { error: insertError } = await supabase.from("products").insert({
        name: name.trim(),
        description: description.trim() || null,
        category_id: Number(categoryId),
        price: Number(price),
        stock: Number(stock),
        image_url: uploadedImage.publicUrl,
      });

      if (insertError) {
        throw insertError;
      }

      uploadedFilePath = null;

      /* Reset form */
      setName("");
      setDescription("");
      setCategoryId("");
      setPrice("");
      setStock("");
      setImage(null);

      navigate("/admin/products");
    } catch (error) {
      if (uploadedFilePath) {
        const { error: cleanupError } = await supabase.storage
          .from("product-images")
          .remove([uploadedFilePath]);

        if (cleanupError) {
          console.error("IMAGE CLEANUP ERROR:", cleanupError);
        }
      }

      console.error("CREATE PRODUCT ERROR:", error);

      setError(
        error instanceof Error ? error.message : t("productAdd.error.error")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="add-product-page">
        <h1 className="xlarge">{t("productAdd.title")}</h1>

        <div className="add-product-container">
          <form className="product-form" onSubmit={handleSubmit}>
            {/* Image */}
            <div className="form-group">
              <label htmlFor="image">{t("productAdd.image")}*</label>
              <input
                id="image"
                className="file-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  setImage(event.target.files?.[0] ?? null);
                }}
                required
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="category">{t("productAdd.category")}*</label>
              <select
                id="category"
                className="form-input"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                disabled={loadingCategories || loading}
                required
              >
                <option value="">
                  {loadingCategories ? t("loading") : t("productAdd.select")}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product name */}
            <div className="form-group">
              <label htmlFor="name">{t("productAdd.name")}*</label>
              <input
                id="name"
                className="form-input"
                type="text"
                placeholder="Product name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description">{t("productAdd.description")}</label>
              <textarea
                id="description"
                className="form-input form-textarea"
                placeholder={t("productAdd.placeholder")}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            {/* Price */}
            <div className="form-group">
              <label htmlFor="price">{t("productAdd.price")}*</label>
              <div className="input-with-symbol">
                <span>€</span>
                <input
                  id="price"
                  className="form-input"
                  type="number"
                  placeholder="9.99"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  required
                />
              </div>
            </div>

            {/* Stock */}
            <div className="form-group">
              <label htmlFor="stock">{t("productAdd.stock")}*</label>
              <input
                id="stock"
                className="form-input"
                type="number"
                placeholder="10"
                min="0"
                step="1"
                value={stock}
                onChange={(event) => setStock(event.target.value)}
                required
              />
            </div>

            {/* Buttons */}
            <div className="form-actions">
              <button
                type="button"
                className="button border round-large margin-top"
                onClick={() => navigate("/admin/products")}
              >
                {t("productAdd.cancel")}
              </button>

              <button
                type="submit"
                className="button black round-large margin-top"
                disabled={loading}
              >
                {loading ? t("productAdd.creating") : t("productAdd.add")}
              </button>
            </div>

            {/* Error */}
            {error && <p className="form-message error-message">{error}</p>}

            {/* Success */}
            {success && (
              <p className="form-message success-message">{success}</p>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

export default ProductAddForm;
