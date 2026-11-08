import { useContext } from "react";
import { CartContext } from "./CartContext";
import type { CartContextProps } from "@/types/product";

export function useCart(): CartContextProps {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
