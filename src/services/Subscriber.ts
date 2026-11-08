import { supabase } from "@/lib/supabase";
import type { SubscriberProps } from "@/types/subscribe";

export const subscriberService = {
  async getSubscribers(): Promise<SubscriberProps[]> {
    const { data, error } = await supabase
      .from("subscribers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async deleteSubscriber(id: number): Promise<void> {
    const { error } = await supabase.from("subscribers").delete().eq("id", id);

    if (error) throw error;
  },
};
