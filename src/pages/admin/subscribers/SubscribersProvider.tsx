import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { subscriberService } from "@/services/Subscriber";
import { SubscribersContext } from "./SubscribersContext";
import type { SubscriberProps } from "@/types/subscribe";

export function SubscribersProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const [subscribers, setSubscribers] = useState<SubscriberProps[]>([]);

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const data = await subscriberService.getSubscribers();
        setSubscribers(data);
      } catch (error) {
        console.error("Failed to fetch subscribers:", error);
      }
    };

    fetchSubscribers();
  }, []);

  const deleteSubscriber = async (id: number) => {
    if (!window.confirm(t("confirm.delete"))) {
      return;
    }

    try {
      await subscriberService.deleteSubscriber(id);

      setSubscribers((prev) =>
        prev.filter((subscriber) => subscriber.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete subscriber:", error);
      throw error;
    }
  };

  return (
    <SubscribersContext.Provider value={{ subscribers, deleteSubscriber }}>
      {children}
    </SubscribersContext.Provider>
  );
}
