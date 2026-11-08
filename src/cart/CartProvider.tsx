import { useState, useEffect, useMemo } from "react";
import { CartContext } from "./CartContext";
import type { CartItem, ProductProps } from "@/types/product";

interface CartProviderProps {
  children: React.ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const savedCart = localStorage.getItem("cart");

      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Failed to load cart:", error);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // localStorage
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  }, [cartItems]);

  // Add to cart
  const addToCart = (product: ProductProps, quantity = 1) => {
    if (!product || product.stock <= 0) {
      return {
        success: false,
        message: "Product is sold out",
      };
    }

    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return {
        success: false,
        message: "Invalid quantity",
      };
    }

    const existing = cartItems.find((item) => item.id === product.id);
    const currentQuantity = existing?.quantity ?? 0;
    const newQuantity = currentQuantity + quantity;

    if (newQuantity > product.stock) {
      return {
        success: false,
        message: `Only ${product.stock} items available`,
      };
    }

    setCartItems((currentItems) => {
      const existing = currentItems.find((item) => item.id === product.id);

      if (existing) {
        return currentItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: newQuantity,
                stock: product.stock,
              }
            : item
        );
      }

      return [
        ...currentItems,

        {
          ...product,
          quantity,
          stock: product.stock,
        },
      ];
    });

    setIsCartOpen(true);

    return {
      success: true,
      message: "",
    };
  };

  // Update quantity
  const updateQuantity = (id: string | number, quantity: number) => {
    setCartItems((currentItems) => {
      const item = currentItems.find((item) => item.id === id);

      if (!item) {
        return currentItems;
      }

      if (quantity <= 0) {
        return currentItems.filter((item) => item.id !== id);
      }

      if (quantity > item.stock) {
        return currentItems;
      }

      return currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity,
            }
          : item
      );
    });
  };

  const increaseQuantity = (id: string | number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id && item.quantity < item.stock
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (id: string | number) => {
    setCartItems((items) =>
      items
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove
  const removeFromCart = (id: string | number) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.id !== id)
    );
  };

  // Clear
  const clearCart = () => {
    setCartItems([]);
  };

  // Item count
  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );
  // Total
  const cartTotal = useMemo(
    () =>
      cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );
  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
