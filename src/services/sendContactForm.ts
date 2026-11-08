import { supabase } from "@/lib/supabase";
import type { ContactFormProps } from "@/types/contact";

export async function sendContactForm(form: ContactFormProps): Promise<void> {
  const { error } = await supabase.from("contacts").insert(form);

  if (error) {
    throw error;
  }
}
