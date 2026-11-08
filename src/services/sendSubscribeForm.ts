import { supabase } from "@/lib/supabase";
import type { SubscribeFormProps } from "@/types/subscribe";

export async function sendSubscribeForm(
  form: SubscribeFormProps
): Promise<void> {
  const { error } = await supabase.from("subscribers").insert(form);

  if (error) {
    throw error;
  }
}
