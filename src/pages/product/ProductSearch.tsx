import "./ProductCollection.css";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProductCard from "./ProductCard";
import type { ProductProps } from "@/types/product";

type SortOption = "newest" | "price-low" | "price-high";
type PageItem = number | "...";

const PAGE_SIZE = 12;
const DEBOUNCE_DELAY = 300;

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

export default function ProductSearch() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const totalPages = Math.ceil(totalProducts / PAGE_SIZE);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Products
  useEffect(() => {
    let ignore = false;

    async function fetchProducts() {
      setLoading(true);
      setError(false);

      const from = (currentPage - 1) * PAGE_SIZE;
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
      const { data, error, count } = await query.range(from, to);

      if (ignore) return;

      if (error) {
        console.error("Failed to fetch products:", error);
        setError(true);
        setProducts([]);
        setTotalProducts(0);
        setLoading(false);
        return;
      }

      setProducts(data ?? []);
      setTotalProducts(count ?? 0);
      setLoading(false);
    }

    fetchProducts();

    return () => {
      ignore = true;
    };
  }, [debouncedSearch, sort, currentPage]);

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
    // if (page < 1 || page > totalPages) return;
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }
    setCurrentPage(page);
  }

  const pageItems = getPageItems(currentPage, totalPages);

  return (
    <>
      <div className="auto justify text-grey padding-64">
        {/* Search */}
        <div className="padding margin-top">
          <input
            className="input border small round-xxlarge"
            type="search"
            placeholder={t("search.search")}
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            aria-label={t("search.search")}
          />
        </div>

        {/* Sort */}
        <div className="margin right">
          <select
            className="button border small mobile"
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

        <h1 className="container xlarge center">{t("search.results")}</h1>

        {/* Product Grid */}
        {loading ? (
          <div role="status" className="padding-64 center">
            <p>{t("loading")}</p>
          </div>
        ) : error ? (
          <p className="padding-64 center" role="alert">
            {t("product.error")}
          </p>
        ) : products.length === 0 ? (
          <p className="center">{t("product.noProduct")}</p>
        ) : (
          <>
            <section className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </section>

            {/* Pagination */}
            {totalPages > 0 && (
              <>
                <nav
                  className="pagination center padding-32"
                  aria-label={t("pagination.pagination")}
                >
                  <button
                    className="button border"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    aria-label={t("pagination.previous")}
                  >
                    &laquo;
                  </button>

                  {pageItems.map((page, index) =>
                    page === "..." ? (
                      <span key={`ellipsis-${index}`}>...</span>
                    ) : (
                      <button
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

                  <button
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
    </>
  );
}
