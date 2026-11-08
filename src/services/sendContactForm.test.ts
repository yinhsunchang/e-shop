import { sendContactForm } from "./sendContactForm";
import { supabase } from "@/lib/supabase";

// Mock supabase module
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const mockedSupabase = vi.mocked(supabase);

describe("sendContactForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserts contact form data successfully", async () => {
    const insertMock = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    mockedSupabase.from.mockReturnValue({
      insert: insertMock,
    } as never);

    const formData = {
      name: "John Doe",
      email: "john@test.com",
      subject: "Hello",
      message: "Nice website",
    };

    await expect(sendContactForm(formData)).resolves.toBeUndefined();

    expect(mockedSupabase.from).toHaveBeenCalledWith("contacts");
    expect(insertMock).toHaveBeenCalledWith(formData);
  });

  it("throws error when supabase insert fails", async () => {
    const insertMock = vi.fn().mockResolvedValue({
      data: null,
      error: {
        message: "Database error",
      },
    });

    mockedSupabase.from.mockReturnValue({
      insert: insertMock,
    } as never);

    const formData = {
      name: "John Doe",
      email: "john@test.com",
      subject: "Hello",
      message: "Nice website",
    };

    await expect(sendContactForm(formData)).rejects.toEqual({
      message: "Database error",
    });
  });
});
