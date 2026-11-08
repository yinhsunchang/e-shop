import { createContext } from "react";
import type { ContactProps } from "@/types/contact";

export interface ContactsContextType {
  contacts: ContactProps[];
  loading: boolean;
  deleteContact: (id: number) => Promise<void>;
}

export const ContactsContext = createContext<ContactsContextType | undefined>(
  undefined
);
