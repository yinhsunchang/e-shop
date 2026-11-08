import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactForm from "./ContactForm";
import { sendContactForm } from "@/services/sendContactForm";

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock API
vi.mock("@/services/sendContactForm", () => ({
  sendContactForm: vi.fn(),
}));

const mockedSendContactForm = vi.mocked(sendContactForm);

describe("ContactForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(
      screen.getByPlaceholderText("contact.placeholder.name"),
      "John Doe"
    );

    await user.type(
      screen.getByPlaceholderText("contact.placeholder.email"),
      "john@test.com"
    );

    await user.type(
      screen.getByPlaceholderText("contact.placeholder.subject"),
      "Hello"
    );

    await user.type(
      screen.getByPlaceholderText("contact.placeholder.message"),
      "Nice website!"
    );
  };

  it("renders all form fields", () => {
    render(<ContactForm />);

    expect(
      screen.getByPlaceholderText("contact.placeholder.name")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("contact.placeholder.email")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("contact.placeholder.subject")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("contact.placeholder.message")
    ).toBeInTheDocument();

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("updates input values", async () => {
    const user = userEvent.setup();

    render(<ContactForm />);

    const nameInput = screen.getByPlaceholderText("contact.placeholder.name");

    await user.type(nameInput, "John");

    expect(nameInput).toHaveValue("John");
  });

  it("calls sendContactForm with form data", async () => {
    mockedSendContactForm.mockResolvedValue();

    const user = userEvent.setup();

    render(<ContactForm />);

    await fillForm(user);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(mockedSendContactForm).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@test.com",
        subject: "Hello",
        message: "Nice website!",
      });
    });
  });

  it("shows success message after submit", async () => {
    mockedSendContactForm.mockResolvedValue();

    const user = userEvent.setup();

    render(<ContactForm />);

    await fillForm(user);

    await user.click(screen.getByRole("button"));

    expect(await screen.findByText("contact.success")).toBeInTheDocument();
  });

  it("shows error message when submit fails", async () => {
    mockedSendContactForm.mockRejectedValue({
      status: "error",
      message: "Send failed",
    });

    const user = userEvent.setup();

    render(<ContactForm />);

    await fillForm(user);

    await user.click(screen.getByRole("button"));

    expect(await screen.findByText("contact.fail")).toBeInTheDocument();
  });

  it("clears the form after successful submit", async () => {
    mockedSendContactForm.mockResolvedValue();

    const user = userEvent.setup();

    render(<ContactForm />);

    await fillForm(user);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("contact.placeholder.name")
      ).toHaveValue("");

      expect(
        screen.getByPlaceholderText("contact.placeholder.email")
      ).toHaveValue("");

      expect(
        screen.getByPlaceholderText("contact.placeholder.subject")
      ).toHaveValue("");

      expect(
        screen.getByPlaceholderText("contact.placeholder.message")
      ).toHaveValue("");
    });
  });

  it("disables submit button while submitting", async () => {
    mockedSendContactForm.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const user = userEvent.setup();

    render(<ContactForm />);

    await fillForm(user);

    const button = screen.getByRole("button");

    await user.click(button);

    expect(button).toBeDisabled();

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });
});
