import { sendSubscribeForm } from "./sendSubscribeForm";
import { supabase } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("sendSubscribeForm", () => {
  const mockInsert = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(supabase.from).mockReturnValue({
      insert: mockInsert,
    } as never);
  });

  it("inserts subscription successfully", async () => {
    mockInsert.mockResolvedValue({
      error: null,
    });

    const form = {
      name: "John",
      email: "john@test.com",
    };

    await expect(sendSubscribeForm(form)).resolves.toBeUndefined();

    expect(supabase.from).toHaveBeenCalledWith("subscribers");
    expect(mockInsert).toHaveBeenCalledWith(form);
  });

  it("throws when Supabase returns an error", async () => {
    const error = new Error("Insert failed");

    mockInsert.mockResolvedValue({
      error,
    });

    const form = {
      name: "John",
      email: "john@test.com",
    };

    await expect(sendSubscribeForm(form)).rejects.toThrow("Insert failed");
  });
});
