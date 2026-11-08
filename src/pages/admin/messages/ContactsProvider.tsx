import { useEffect, useState, useCallback, useMemo } from "react";
import { ContactsContext } from "./ContactsContext";
import { contactService } from "@/services/Contact";
import type { ContactProps } from "@/types/contact";
import { useTranslation } from "react-i18next";

export function ContactsProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  const [contacts, setContacts] = useState<ContactProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const data = await contactService.getContacts();
        setContacts(data);
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const deleteContact = useCallback(
    async (id: number) => {
      if (!window.confirm(t("confirm.delete"))) {
        return;
      }

      try {
        await contactService.deleteContact(id);
        setContacts((prev) => prev.filter((contact) => contact.id !== id));
      } catch (error) {
        console.error("Failed to delete contact:", error);
        throw error;
      }
    },
    [t]
  );

  const value = useMemo(
    () => ({
      contacts,
      loading,
      deleteContact,
    }),
    [contacts, loading, deleteContact]
  );

  return (
    <ContactsContext.Provider value={value}>
      {children}
    </ContactsContext.Provider>
  );
}
