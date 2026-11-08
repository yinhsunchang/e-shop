import { createContext } from "react";
import type { CartContextProps } from "@/types/product";

export const CartContext = createContext<CartContextProps | null>(null);
