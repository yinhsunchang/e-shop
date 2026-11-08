import { supabase } from "@/lib/supabase";
import type { ContactProps } from "@/types/contact";

export const contactService = {
  async getContacts(): Promise<ContactProps[]> {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async deleteContact(id: number): Promise<void> {
    const { error } = await supabase.from("contacts").delete().eq("id", id);

    if (error) throw error;
  },
};
