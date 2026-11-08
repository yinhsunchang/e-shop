import { useContext } from "react";
import { SubscribersContext } from "./SubscribersContext";

export function useSubscribers() {
  const context = useContext(SubscribersContext);

  if (!context) {
    throw new Error("useSubscribers must be used within SubscribersProvider");
  }

  return context;
}
