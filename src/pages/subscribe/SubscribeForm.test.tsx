import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SubscribeForm from "./SubscribeForm";
import { sendSubscribeForm } from "@/services/sendSubscribeForm";

vi.mock("@/services/sendSubscribeForm", () => ({
  sendSubscribeForm: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("SubscribeForm", () => {
  const mockSend = vi.mocked(sendSubscribeForm);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function fillForm() {
    fireEvent.change(screen.getByLabelText("name"), {
      target: {
        value: "John",
      },
    });

    fireEvent.change(screen.getByLabelText("email"), {
      target: {
        value: "john@test.com",
      },
    });
  }

  it("submits subscription successfully", async () => {
    const user = userEvent.setup();

    mockSend.mockResolvedValue(undefined);

    render(<SubscribeForm />);

    fillForm();

    await user.click(
      screen.getByRole("button", {
        name: "subscribe.send",
      })
    );

    await waitFor(() => {
      expect(mockSend).toHaveBeenCalledWith({
        name: "John",
        email: "john@test.com",
      });
    });

    expect(screen.getByText("subscribe.success")).toBeInTheDocument();
  });

  it("shows error when submit fails", async () => {
    const user = userEvent.setup();

    mockSend.mockRejectedValue(new Error("failed"));

    render(<SubscribeForm />);

    fillForm();

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("subscribe.error")).toBeInTheDocument();
    });
  });

  it("disables fields while submitting", async () => {
    const user = userEvent.setup();

    mockSend.mockImplementation(() => new Promise(() => {}));

    render(<SubscribeForm />);

    fillForm();

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByLabelText("name")).toBeDisabled();
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });
});
