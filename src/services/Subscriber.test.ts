import { supabase } from "@/lib/supabase";
import type { SubscriberProps } from "@/types/subscribe";
import { subscriberService } from "./Subscriber";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const mockSubscribers: SubscriberProps[] = [
  {
    id: 1,
    name: "Mimi",
    email: "mimi@example.com",
    created_at: "2026-08-20T11:00:00Z",
  },
  {
    id: 2,
    name: "John",
    email: "john@example.com",
    created_at: "2026-08-20T12:00:00Z",
  },
];

/**
 * Supabase's from() returns a large PostgrestQueryBuilder.
 * For unit tests we only need to mock the methods used by the service.
 */
type SupabaseFromMock = ReturnType<typeof supabase.from>;

function mockSupabaseFrom(value: object) {
  vi.mocked(supabase.from).mockReturnValue(
    value as unknown as SupabaseFromMock
  );
}

describe("subscriberService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --------------------------------------------------
  // getSubscribers
  // --------------------------------------------------

  describe("getSubscribers", () => {
    it("should return subscribers", async () => {
      const order = vi.fn().mockResolvedValue({
        data: mockSubscribers,
        error: null,
      });

      const select = vi.fn().mockReturnValue({
        order,
      });

      mockSupabaseFrom({
        select,
      });

      const result = await subscriberService.getSubscribers();

      expect(supabase.from).toHaveBeenCalledWith("subscribers");

      expect(select).toHaveBeenCalledWith("*");

      expect(order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });

      expect(result).toEqual(mockSubscribers);
    });

    it("should throw when fetching subscribers fails", async () => {
      const error = new Error("Failed to fetch subscribers");

      const order = vi.fn().mockResolvedValue({
        data: null,
        error,
      });

      const select = vi.fn().mockReturnValue({
        order,
      });

      mockSupabaseFrom({
        select,
      });

      await expect(subscriberService.getSubscribers()).rejects.toThrow(
        "Failed to fetch subscribers"
      );
    });
  });

  // --------------------------------------------------
  // deleteSubscriber
  // --------------------------------------------------

  describe("deleteSubscriber", () => {
    it("should delete a subscriber", async () => {
      const eq = vi.fn().mockResolvedValue({
        error: null,
      });

      const deleteMock = vi.fn().mockReturnValue({
        eq,
      });

      mockSupabaseFrom({
        delete: deleteMock,
      });

      await subscriberService.deleteSubscriber(1);

      expect(supabase.from).toHaveBeenCalledWith("subscribers");

      expect(deleteMock).toHaveBeenCalledTimes(1);

      expect(eq).toHaveBeenCalledWith("id", 1);
    });

    it("should throw when deleting subscriber fails", async () => {
      const error = new Error("Failed to delete subscriber");

      const eq = vi.fn().mockResolvedValue({
        error,
      });

      const deleteMock = vi.fn().mockReturnValue({
        eq,
      });

      mockSupabaseFrom({
        delete: deleteMock,
      });

      await expect(subscriberService.deleteSubscriber(1)).rejects.toThrow(
        "Failed to delete subscriber"
      );
    });
  });
});
