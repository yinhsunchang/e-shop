import "./ProductEdit.css";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getStoragePath } from "@/lib/storage";
import type { ProductProps } from "@/types/product";
import type { CategoryProps } from "@/types/category";

export default function EditProduct() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductProps | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch Categories
  useEffect(() => {
    let cancelled = false;

    async function fetchCategories() {
      setLoadingCategories(true);

      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name", {
          ascending: true,
        });

      if (cancelled) return;

      if (error) {
        console.error("FETCH CATEGORIES ERROR:", error);

        setError(t("productEdit.error.fetchCategories"));
        setLoadingCategories(false);

        return;
      }

      setCategories(data ?? []);
      setLoadingCategories(false);
    }

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, [t]);

  // Fetch Product
  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      if (!id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("FETCH PRODUCT ERROR:", error);

        setError(t("productEdit.error.fetchProduct"));
        setLoading(false);
        return;
      }

      if (!data) {
        setProduct(null);
        setLoading(false);
        return;
      }

      setProduct(data);
      setLoading(false);
    }

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [id, t]);

  // Populate Form
  useEffect(() => {
    if (!product) return;

    setCategoryId(String(product.category_id));
    setName(product.name);
    setDescription(product.description ?? "");
    setPrice(String(product.price));
    setStock(String(product.stock));
  }, [product]);

  // Cleanup Image Preview
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Handle Image Change
  function handleImageChange(file: File | null) {
    setNewImage(file);

    setImagePreview(file ? URL.createObjectURL(file) : null);
  }

  // Handle Submit
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!product || saving) return;

    setError("");

    // 1. Validation
    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    if (!name.trim()) {
      setError(t("productEdit.validation.name"));
      return;
    }

    if (!categoryId) {
      setError(t("productEdit.validation.category"));
      return;
    }

    if (
      price.trim() === "" ||
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0 ||
      !/^\d+(\.\d{1,2})?$/.test(price)
    ) {
      setError(t("productEdit.validation.price"));
      return;
    }

    if (
      stock.trim() === "" ||
      !Number.isInteger(parsedStock) ||
      parsedStock < 0
    ) {
      setError(t("productEdit.validation.stock"));
      return;
    }

    if (
      newImage &&
      !["image/jpeg", "image/png", "image/webp"].includes(newImage.type)
    ) {
      setError(t("productEdit.validation.imageType"));
      return;
    }

    if (newImage && newImage.size > 5 * 1024 * 1024) {
      setError(t("productEdit.validation.imageSize"));
      return;
    }

    let uploadedFilePath: string | null = null;

    try {
      setSaving(true);

      let imageUrl = product.image_url;

      // 2. Upload new image
      if (newImage) {
        const fileExt = newImage.name.split(".").pop()?.toLowerCase();

        if (!fileExt) {
          throw new Error(t("productEdit.validation.fileExt"));
        }

        const filePath = `products/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, newImage, {
            contentType: newImage.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        uploadedFilePath = filePath;

        // New public URL
        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        imageUrl = data.publicUrl;
      }

      // 3. Update database
      const { error: updateError } = await supabase
        .from("products")
        .update({
          name: name.trim(),
          description: description.trim() || null,
          category_id: Number(categoryId),
          price: parsedPrice,
          stock: parsedStock,
          image_url: imageUrl,
        })
        .eq("id", product.id);

      if (updateError) throw updateError;

      // Database Update Successful
      uploadedFilePath = null;

      // 4. Delete old image
      if (newImage && product.image_url) {
        const oldPath = getStoragePath(product.image_url);

        if (oldPath) {
          const { error: deleteError } = await supabase.storage
            .from("product-images")
            .remove([oldPath]);

          if (deleteError) {
            console.error("OLD IMAGE CLEANUP ERROR:", deleteError);
          }
        }
      }

      // 5. Navigate
      navigate("/admin/products");
    } catch (error) {
      console.error("UPDATE PRODUCT ERROR:", error);

      // Cleanup New Image if Database Update Failed
      if (uploadedFilePath) {
        const { error: cleanupError } = await supabase.storage
          .from("product-images")
          .remove([uploadedFilePath]);

        if (cleanupError) {
          console.error("NEW IMAGE CLEANUP ERROR:", cleanupError);
        }
      }

      setError(
        error instanceof Error ? error.message : t("productEdit.error.error")
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div role="status" className="padding-64 center">
        <p>{t("loading")}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <h1 className="xlarge">{t("productEdit.notFound")}</h1>

        {error && <p role="alert">{error}</p>}

        <button onClick={() => navigate("/admin/products")}>
          {t("productEdit.back")}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="edit-product-page">
        <h1 className="xlarge">{t("productEdit.title")}</h1>

        {error && <p role="alert">{error}</p>}

        <div className="edit-product-container">
          <form className="edit-product-form" onSubmit={handleSubmit}>
            {/* Left Column */}
            <div className="form-main">
              {/* Product Information */}
              <section className="form-card">
                <div className="card-header">
                  <h2>{t("productEdit.info")}</h2>
                  <p>{t("productEdit.infoP")}.</p>
                </div>

                <div className="card-content">
                  {/* Name */}
                  <div className="form-group">
                    <label htmlFor="name">{t("productEdit.name")}</label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder={t("productEdit.namePlaceholder")}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="form-group">
                    <label htmlFor="description">
                      {t("productEdit.description")}
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder={t("productEdit.descriptionPlaceholder")}
                    />
                  </div>

                  {/* Price */}
                  <div className="form-group">
                    <label htmlFor="price">{t("productEdit.price")}</label>
                    <div className="input-with-prefix">
                      <span>€</span>
                      <input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Inventory */}
              <section className="form-card">
                <div className="card-header">
                  <h2>{t("productEdit.inventory")}</h2>
                  <p>{t("productEdit.inventoryP")}</p>
                </div>

                <div className="card-content">
                  <div className="form-group">
                    <label htmlFor="stock">{t("productEdit.stock")}</label>
                    <input
                      id="stock"
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(event) => setStock(event.target.value)}
                      placeholder="0"
                      required
                    />
                    <span className="input-help">
                      {t("productEdit.stockP")}
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column */}
            <aside className="form-sidebar">
              {/* Image */}
              <section className="form-card">
                <div className="card-header">
                  <h2>{t("productEdit.image")}</h2>
                  <p>{t("productEdit.imageP")}</p>
                </div>

                <div className="card-content">
                  <div className="image-preview">
                    <img
                      src={imagePreview ?? product.image_url ?? undefined}
                      alt={product.name}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="image">
                      {t("productEdit.imageReplace")}
                    </label>
                    <input
                      id="image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => {
                        handleImageChange(event.target.files?.[0] ?? null);
                      }}
                    />
                  </div>
                </div>
              </section>

              {/* Category */}
              <section className="form-card">
                <div className="card-header">
                  <h2>{t("productEdit.category")}</h2>
                  <p>{t("productEdit.categoryP")}</p>
                </div>

                <div className="card-content">
                  <div className="form-group">
                    <label htmlFor="category">
                      {t("productEdit.category")}
                    </label>
                    <select
                      id="category"
                      value={categoryId}
                      onChange={(event) => setCategoryId(event.target.value)}
                      disabled={loadingCategories || loading}
                      required
                    >
                      <option value="">
                        {loadingCategories
                          ? t("loading")
                          : t("productEdit.select")}
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>
            </aside>

            {/* Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="button border round-large margin-top"
                onClick={() => navigate("/admin/products")}
              >
                {t("productEdit.cancel")}
              </button>

              <button
                type="submit"
                className="button black round-large margin-top"
                disabled={saving || loadingCategories}
              >
                {saving ? t("productEdit.saving") : t("productEdit.save")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
