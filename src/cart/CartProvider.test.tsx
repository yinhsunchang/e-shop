import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { CartProvider } from "./CartProvider";
import { CartContext } from "./CartContext";
import type { ProductProps } from "@/types/product";

// Wrapper
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

// Mock Product
const mockProduct: ProductProps = {
  id: 1,
  name: "Test Product",
  price: 100,
  description: "This is a test product",
  image_url: "/images/test.jpg",
  category_id: 1,
  stock: 10,
};

// Helper
const renderCart = () => {
  return renderHook(
    () => {
      const context = React.useContext(CartContext);

      if (!context) {
        throw new Error("CartContext is undefined");
      }

      return context;
    },
    { wrapper }
  );
};

import React from "react";

describe("CartProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // Initial state
  describe("Initial State", () => {
    it("should initialize with an empty cart", () => {
      const { result } = renderCart();

      expect(result.current.cartItems).toEqual([]);
      expect(result.current.cartCount).toBe(0);
      expect(result.current.cartTotal).toBe(0);
      expect(result.current.isCartOpen).toBe(false);
    });

    it("should load cart data from localStorage", () => {
      const savedCart = [
        {
          ...mockProduct,
          quantity: 2,
        },
      ];

      localStorage.setItem("cart", JSON.stringify(savedCart));

      const { result } = renderCart();

      expect(result.current.cartItems).toEqual(savedCart);
      expect(result.current.cartCount).toBe(2);
      expect(result.current.cartTotal).toBe(200);
    });

    it("should initialize with empty cart if localStorage contains invalid JSON", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      localStorage.setItem("cart", "invalid-json");

      const { result } = renderCart();

      expect(result.current.cartItems).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  // Add to cart
  describe("addToCart", () => {
    it("should add a product to cart", () => {
      const { result } = renderCart();

      act(() => {
        result.current.addToCart(mockProduct);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0]).toMatchObject({
        id: 1,
        quantity: 1,
      });
      expect(result.current.isCartOpen).toBe(true);
    });

    it("should add product with custom quantity", () => {
      const { result } = renderCart();

      act(() => {
        result.current.addToCart(mockProduct, 3);
      });

      expect(result.current.cartItems[0].quantity).toBe(3);
    });

    it("should increase quantity when adding an existing product", () => {
      const { result } = renderCart();

      act(() => {
        result.current.addToCart(mockProduct, 2);
      });

      act(() => {
        result.current.addToCart(mockProduct, 3);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].quantity).toBe(5);
    });

    it("should return error when product is sold out", () => {
      const { result } = renderCart();

      let response;

      act(() => {
        response = result.current.addToCart({
          ...mockProduct,
          stock: 0,
        });
      });

      expect(response).toEqual({
        success: false,
        message: "Product is sold out",
      });

      expect(result.current.cartItems).toHaveLength(0);
    });

    it("should return error when quantity is invalid", () => {
      const { result } = renderCart();

      const invalidQuantities = [0, -1, 1.5];

      invalidQuantities.forEach((quantity) => {
        let response;

        act(() => {
          response = result.current.addToCart(mockProduct, quantity);
        });

        expect(response).toEqual({
          success: false,
          message: "Invalid quantity",
        });
      });

      expect(result.current.cartItems).toHaveLength(0);
    });

    it("should not add product if quantity exceeds stock", () => {
      const { result } = renderCart();

      let response;

      act(() => {
        response = result.current.addToCart(mockProduct, 11);
      });

      expect(response).toEqual({
        success: false,
        message: "Only 10 items available",
      });

      expect(result.current.cartItems).toHaveLength(0);
    });

    it("should not exceed stock when adding an existing product", () => {
      const { result } = renderCart();

      act(() => {
        result.current.addToCart(mockProduct, 8);
      });

      let response;

      act(() => {
        response = result.current.addToCart(mockProduct, 3);
      });

      expect(response).toEqual({
        success: false,
        message: "Only 10 items available",
      });

      expect(result.current.cartItems[0].quantity).toBe(8);
    });
  });

  // Update quantity
  describe("updateQuantity", () => {
    it("should update product quantity", () => {
      const { result } = renderCart();

      act(() => {
        result.current.addToCart(mockProduct, 2);
      });

      act(() => {
        result.current.updateQuantity(1, 5);
      });

      expect(result.current.cartItems[0].quantity).toBe(5);
    });

    it("should remove product when quantity is zero", () => {
      const { result } = renderCart();

      act(() => {
        result.current.addToCart(mockProduct);
      });

      act(() => {
        result.current.updateQuantity(1, 0);
      });

      expect(result.current.cartItems).toHaveLength(0);
    });

    it("should remove product when quantity is negative", () => {
      const { result } = renderCart();

      act(() => {
        result.current.addToCart(mockProduct);
      });

      act(() => {
        result.current.updateQuantity(1, -1);
      });

      expect(result.current.cartItems).toHaveLength(0);
    });

    it("should not update quantity if it exceeds stock", () => {
      const { result } = renderCart();

      act(() => {
        result.current.addToCart(mockProduct, 2);
      });

      act(() => {
        result.current.updateQuantity(1, 11);
      });

      expect(result.current.cartItems[0].quantity).toBe(2);
    });

    it("should do nothing if product does not exist", () => {
      const { result } = renderCart();

      act(() => {
        result.current.updateQuantity(999, 5);
      });

      expect(result.current.cartItems).toHaveLength(0);
    });
  });

  // Increase quantity
  describe("increaseQuantity", () => {
    it("should increase product quantity by one", () => {
      const { result } = renderCart();

      act(() => {
        result.current.addToCart(mockProduct, 2);
      });

      act(() => {
        result.current.increaseQuantity(1);
      });

      expect(result.current.cartItems[0].quantity).toBe(3);
    });

    it("should not increase quantity beyond stock", () => {
      const { result } = renderCart();

      act(() => {
        result.current.addToCart(mockProduct, 10);
      });

      act(() => {
        result.current.increaseQuantity(1);
      });

      expect(result.current.cartItems[0].quantity).toBe(10);
    });
  });

  // Decrease quantity
  describe("decreaseQuantity", () => {
    it("should decrease product quantity by one", () => {
      const { result } = renderCart();

      act(() => {
        result.current.addToCart(mockProduct, 3);
      });

      act(() => {
        result.current.decreaseQuantity(1);
      });

      expect(result.current.cartItems[0].quantity).toBe(2);
    });

    it("should remove product when quantity reaches zero", () => {
      const { result } = renderCart();

      act(() => {
        result.current.addToCart(mockProduct, 1);
      });

      act(() => {
        result.current.decreaseQuantity(1);
      });

      expect(result.current.cartItems).toHaveLength(0);
    });
  });

  // Remove from cart
  describe("removeFromCart", () => {
    it("should remove product from cart", () => {
      const { result } = renderCart();

      act(() => {
        result.current.addToCart(mockProduct);
      });

      act(() => {
        result.current.removeFromCart(1);
      });

      expect(result.current.cartItems).toHaveLength(0);
    });

    it("should only remove the specified product", () => {
      const { result } = renderCart();

      const secondProduct = {
        ...mockProduct,
        id: 2,
        name: "Second Product",
      };

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.addToCart(secondProduct);
      });

      act(() => {
        result.current.removeFromCart(1);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].id).toBe(2);
    });
  });

  // Clear cart
  describe("clearCart", () => {
    it("should clear all products from cart", () => {
      const { result } = renderCart();

      act(() => {
        result.current.addToCart(mockProduct);
      });

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.cartItems).toEqual([]);
      expect(result.current.cartCount).toBe(0);
      expect(result.current.cartTotal).toBe(0);
    });
  });

  // Cart count
  describe("cartCount", () => {
    it("should calculate total quantity of products", () => {
      const { result } = renderCart();

      act(() => {
        result.current.addToCart(mockProduct, 2);
        result.current.addToCart(
          {
            ...mockProduct,
            id: 2,
            price: 200,
          },
          3
        );
      });

      expect(result.current.cartCount).toBe(5);
    });
  });

  // Cart total
  describe("cartTotal", () => {
    it("should calculate total price of products", () => {
      const { result } = renderCart();

      act(() => {
        result.current.addToCart(mockProduct, 2);
        result.current.addToCart(
          {
            ...mockProduct,
            id: 2,
            price: 200,
          },
          3
        );
      });

      expect(result.current.cartTotal).toBe(800);
    });
  });

  // Cart open / close
  describe("isCartOpen", () => {
    it("should open cart after adding a product", () => {
      const { result } = renderCart();

      act(() => {
        result.current.addToCart(mockProduct);
      });

      expect(result.current.isCartOpen).toBe(true);
    });

    it("should close cart using setIsCartOpen", () => {
      const { result } = renderCart();

      act(() => {
        result.current.setIsCartOpen(true);
      });

      act(() => {
        result.current.setIsCartOpen(false);
      });

      expect(result.current.isCartOpen).toBe(false);
    });
  });

  // localStorage
  describe("localStorage", () => {
    it("should save cart data to localStorage when cart changes", async () => {
      const { result } = renderCart();

      act(() => {
        result.current.addToCart(mockProduct, 2);
      });

      await waitFor(() => {
        const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");

        expect(savedCart).toHaveLength(1);
        expect(savedCart[0].quantity).toBe(2);
      });
    });

    it("should save empty array when cart is cleared", async () => {
      const { result } = renderCart();

      act(() => {
        result.current.addToCart(mockProduct);
      });

      act(() => {
        result.current.clearCart();
      });

      await waitFor(() => {
        expect(localStorage.getItem("cart")).toBe("[]");
      });
    });

    it("should handle localStorage save error", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("Storage error");
      });

      const { result } = renderCart();

      act(() => {
        result.current.addToCart(mockProduct);
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to save cart:",
        expect.any(Error)
      );
    });
  });
});
