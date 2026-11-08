import { describe, expect, it, vi, beforeEach } from "vitest";
import { contactService } from "./Contact";
import { supabase } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("contactService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getContacts", () => {
    it("should return contacts", async () => {
      const contacts = [
        {
          id: 1,
          name: "John",
          email: "john@example.com",
        },
        {
          id: 2,
          name: "Jane",
          email: "jane@example.com",
        },
      ];

      const orderMock = vi.fn().mockResolvedValue({
        data: contacts,
        error: null,
      });

      const selectMock = vi.fn(() => ({
        order: orderMock,
      }));

      vi.mocked(supabase.from).mockReturnValue({
        select: selectMock,
      } as never);

      const result = await contactService.getContacts();

      expect(result).toEqual(contacts);
      expect(supabase.from).toHaveBeenCalledWith("contacts");
      expect(selectMock).toHaveBeenCalledWith("*");
      expect(orderMock).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
    });

    it("should throw when Supabase returns an error", async () => {
      const error = new Error("Failed to fetch contacts");

      const orderMock = vi.fn().mockResolvedValue({
        data: null,
        error,
      });

      const selectMock = vi.fn(() => ({
        order: orderMock,
      }));

      vi.mocked(supabase.from).mockReturnValue({
        select: selectMock,
      } as never);

      await expect(contactService.getContacts()).rejects.toThrow(
        "Failed to fetch contacts"
      );
    });
  });

  describe("deleteContact", () => {
    it("should delete a contact by id", async () => {
      const eqMock = vi.fn().mockResolvedValue({
        error: null,
      });

      const deleteMock = vi.fn(() => ({
        eq: eqMock,
      }));

      vi.mocked(supabase.from).mockReturnValue({
        delete: deleteMock,
      } as never);

      await contactService.deleteContact(123);

      expect(supabase.from).toHaveBeenCalledWith("contacts");
      expect(deleteMock).toHaveBeenCalled();
      expect(eqMock).toHaveBeenCalledWith("id", 123);
    });

    it("should throw when Supabase returns an error", async () => {
      const error = new Error("Failed to delete contact");

      const eqMock = vi.fn().mockResolvedValue({
        error,
      });

      const deleteMock = vi.fn(() => ({
        eq: eqMock,
      }));

      vi.mocked(supabase.from).mockReturnValue({
        delete: deleteMock,
      } as never);

      await expect(contactService.deleteContact(123)).rejects.toThrow(
        "Failed to delete contact"
      );
    });
  });
});
