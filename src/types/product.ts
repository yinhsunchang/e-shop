import type { Dispatch, SetStateAction } from "react";

export interface ProductProps {
  id: number;
  image_url: string | null;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category_id: number;
}

export interface CartItem extends ProductProps {
  quantity: number;
}

export interface CartContextProps {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: Dispatch<SetStateAction<boolean>>;
  addToCart: (
    product: ProductProps,
    quantity?: number
  ) => {
    success: boolean;
    message: string;
  };
  updateQuantity: (id: string | number, quantity: number) => void;
  increaseQuantity: (id: string | number) => void;
  decreaseQuantity: (id: string | number) => void;
  removeFromCart: (id: string | number) => void;
  clearCart: () => void;
}
