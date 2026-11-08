import { createContext } from "react";
import type { SubscriberProps } from "@/types/subscribe";

export interface SubscribersContextType {
  subscribers: SubscriberProps[];
  deleteSubscriber: (id: number) => Promise<void>;
}

export const SubscribersContext = createContext<
  SubscribersContextType | undefined
>(undefined);
