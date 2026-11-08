import "./Products.css";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getStoragePath } from "@/lib/storage";
import type { ProductProps } from "@/types/product";

type SortOption = "newest" | "price-low" | "price-high";
type PageItem = number | "...";

const PAGE_SIZE = 12;
const DEBOUNCE_DELAY = 300;

// Pagination helper
function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: PageItem[] = [1];

  const left = Math.max(2, currentPage - 1);
  const right = Math.min(totalPages - 1, currentPage + 1);

  if (left > 2) {
    pages.push("...");
  }

  for (let page = left; page <= right; page++) {
    pages.push(page);
  }

  if (right < totalPages - 1) {
    pages.push("...");
  }

  pages.push(totalPages);

  return pages;
}

function ProductsAdmin() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const totalPages = Math.ceil(totalProducts / PAGE_SIZE);

  // Price formatter
  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        style: "currency",
        currency: "EUR",
      }),
    [i18n.language]
  );

  // Fetch Products
  const fetchProducts = useCallback(
    async (page: number = currentPage) => {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase.from("products").select("*", { count: "exact" });

      // Search
      if (debouncedSearch) {
        const keyword = debouncedSearch.replace(/[\\%_]/g, "\\$&");

        query = query.ilike("name", `%${keyword}%`);
      }

      // Sort
      switch (sort) {
        case "price-low":
          query = query
            .order("price", { ascending: true })
            .order("id", { ascending: true });
          break;

        case "price-high":
          query = query
            .order("price", { ascending: false })
            .order("id", { ascending: true });
          break;

        case "newest":
        default:
          query = query
            .order("created_at", { ascending: false })
            .order("id", { ascending: true });
          break;
      }

      // Pagination
      const { data, error: fetchError, count } = await query.range(from, to);

      if (fetchError) {
        throw fetchError;
      }

      return {
        products: data ?? [],
        total: count ?? 0,
      };
    },
    [currentPage, debouncedSearch, sort]
  );

  // Load Products
  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const result = await fetchProducts(currentPage);

        if (ignore) return;

        const newTotalPages = Math.ceil(result.total / PAGE_SIZE);

        // Correct invalid page after deletion or filtering
        if (newTotalPages > 0 && currentPage > newTotalPages) {
          setCurrentPage(newTotalPages);
          return;
        }

        setProducts(result.products);
        setTotalProducts(result.total);
      } catch (error) {
        if (ignore) return;

        console.error("Failed to fetch products:", error);

        setError(t("products.error.fetch"));
        setProducts([]);
        setTotalProducts(0);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      ignore = true;
    };
  }, [fetchProducts, currentPage, t]);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [search]);

  // Search Change
  function handleSearchChange(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  // Sort Change
  function handleSortChange(value: SortOption) {
    setSort(value);
    setCurrentPage(1);
  }

  // Pagination
  function goToPage(page: number) {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    setCurrentPage(page);
  }

  const pageItems = getPageItems(currentPage, totalPages);

  // Delete database product record
  async function deleteProductRecord(id: ProductProps["id"]) {
    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .select("id");

    if (error) throw error;

    if (!data || data.length === 0) {
      throw new Error(t("products.error.delete"));
    }
  }

  // Delete product image
  async function deleteProductImage(imageUrl: string) {
    const path = getStoragePath(imageUrl);

    if (!path) {
      throw new Error(t("products.error.path"));
    }

    const { data, error } = await supabase.storage
      .from("product-images")
      .remove([path]);

    if (error) throw error;

    if (!data || data.length === 0) {
      throw new Error(t("products.error.deleteImage"));
    }
  }

  // Handle Delete
  async function handleDelete(product: ProductProps) {
    const productId = String(product.id);

    if (deletingIds.includes(productId)) return;

    const confirmed = window.confirm(
      `${t("products.delete")} "${product.name}"?`
    );

    if (!confirmed) return;

    setDeletingIds((prev) => [...prev, productId]);

    try {
      // 1. Delete database record
      await deleteProductRecord(product.id);

      // 2. Update UI immediately
      const remainingProducts = Math.max(0, totalProducts - 1);
      const newTotalPages = Math.ceil(remainingProducts / PAGE_SIZE);
      const targetPage = Math.max(1, Math.min(currentPage, newTotalPages || 1));

      setProducts((prev) => prev.filter((item) => item.id !== product.id));
      setTotalProducts(remainingProducts);

      // 3. Delete Storage image
      let imageCleanupFailed = false;

      if (product.image_url) {
        try {
          await deleteProductImage(product.image_url);
        } catch (imageError) {
          imageCleanupFailed = true;

          console.error(
            "Product deleted, but image cleanup failed:",
            imageError
          );
        }
      }

      // 4. Refresh correct page
      if (currentPage !== targetPage) {
        setCurrentPage(targetPage);
      } else if (remainingProducts > 0) {
        try {
          const result = await fetchProducts(targetPage);

          setProducts(result.products);
          setTotalProducts(result.total);
        } catch (refreshError) {
          console.error("Failed to refresh products:", refreshError);
        }
      } else {
        setProducts([]);
        setTotalProducts(0);
        setCurrentPage(1);
      }

      // 5. Show result
      if (imageCleanupFailed) {
        window.alert(t("products.errorImage"));
      } else {
        window.alert(t("products.deleteSuccess"));
      }
    } catch (error) {
      console.error("Failed to delete product:", error);

      window.alert(
        error instanceof Error ? error.message : t("products.errorUnexpected")
      );

      // Refresh after database deletion failure
      try {
        const result = await fetchProducts(currentPage);

        setProducts(result.products);
        setTotalProducts(result.total);
      } catch (refreshError) {
        console.error("Failed to refresh products:", refreshError);
      }
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== productId));
    }
  }

  if (loading) {
    return (
      <div role="status" className="padding-64 center">
        <p>{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      <h1 className="xlarge">{t("products.title")}</h1>

      <div className="products-container">
        {/* Add */}
        <div className="products-header bar">
          <Link
            to="/admin/products/new"
            className="bar-item button black mobile margin-top round-large right"
            title={t("products.add")}
          >
            <i className="fa fa-plus" aria-hidden="true"></i>
            <span> {t("products.add")}</span>
          </Link>
        </div>

        <div className="bar">
          {/* Search */}
          <input
            className="input border small round-xxlarge"
            type="search"
            placeholder={t("search.search")}
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            aria-label={t("search.search")}
          />
          {/* Sort */}
          <select
            className="button border block margin-bottom margin-top"
            value={sort}
            onChange={(event) =>
              handleSortChange(event.target.value as SortOption)
            }
            aria-label={t("product.sort.label")}
          >
            <option value="newest">{t("product.sort.newest")}</option>
            <option value="price-low">{t("product.sort.priceLow")}</option>
            <option value="price-high">{t("product.sort.priceHigh")}</option>
          </select>
        </div>

        {error ? (
          <p role="alert" className="products-error">
            {error}
          </p>
        ) : products.length === 0 ? (
          <p className="products-empty">{t("products.empty")}</p>
        ) : (
          <>
            {/* Products Grid */}
            <div className="products-grid">
              {products.map((product) => {
                const isDeleting = deletingIds.includes(String(product.id));

                return (
                  <article key={product.id} className="product-card-admin">
                    {/* Image */}
                    <div className="product-image">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="no-product-image">
                          {t("products.noImage")}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="product-content">
                      <h3>{product.name}</h3>

                      <p className="product-price">
                        {priceFormatter.format(product.price)}
                      </p>

                      <p
                        className={
                          product.stock > 0
                            ? "product-stock"
                            : "product-stock out-of-stock"
                        }
                      >
                        {t("products.stock")}
                        {product.stock}
                      </p>

                      {/* Actions */}
                      <div className="product-actions">
                        {/* Edit */}
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="edit-product-button"
                        >
                          <i className="fa fa-pencil" aria-hidden="true"></i>

                          {t("products.edit")}
                        </Link>

                        {/* Delete */}
                        <button
                          type="button"
                          className="delete-product-button"
                          onClick={() => handleDelete(product)}
                          disabled={isDeleting}
                        >
                          <i className="fa fa-trash" aria-hidden="true"></i>

                          {isDeleting ? t("loading") : t("products.delete")}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <>
                <nav
                  className="pagination center padding-32"
                  aria-label={t("pagination.pagination")}
                >
                  {/* Previous */}
                  <button
                    type="button"
                    className="button border"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    aria-label={t("pagination.previous")}
                  >
                    &laquo;
                  </button>

                  {/* Page Numbers */}
                  {pageItems.map((page, index) =>
                    page === "..." ? (
                      <span key={`ellipsis-${index}`}>...</span>
                    ) : (
                      <button
                        type="button"
                        key={page}
                        className={`button border ${
                          currentPage === page ? "active" : ""
                        }`}
                        onClick={() => goToPage(page)}
                        disabled={loading}
                        aria-current={currentPage === page ? "page" : undefined}
                      >
                        {page}
                      </button>
                    )
                  )}

                  {/* Next */}
                  <button
                    type="button"
                    className="button border"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    aria-label={t("pagination.next")}
                  >
                    &raquo;
                  </button>
                </nav>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProductsAdmin;
