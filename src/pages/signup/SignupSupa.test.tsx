import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Signup from "./SignupSupa";

// Mock useAuth
const mockSignUp = vi.fn();

vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    signUp: mockSignUp,
  }),
}));

// Mock translations
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "signup.title": "Sign Up",
        "signup.email": "Email",
        "signup.password": "Password",
        "signup.emailPlaceholder": "you@example.com",
        "signup.required": "Please fill in all fields",
        "signup.signupFailed": "Registration failed",
        "signup.genericError": "Something went wrong",
        "signup.confirmEmail":
          "Please check your email to confirm your account",
        "signup.loading": "Loading...",
        "signup.signup": "Sign Up",
        "signup.already": "Already registered?",
        "signup.signin": "Sign In",
      };

      return translations[key] ?? key;
    },
  }),
}));

// Render helper
function renderSignup() {
  return render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>
  );
}

describe("Signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Basic rendering
  it("should render signup form correctly", () => {
    renderSignup();

    expect(
      screen.getByRole("heading", { name: "Sign Up" })
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Email")).toBeInTheDocument();

    expect(screen.getByLabelText("Password")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Sign In" })).toHaveAttribute(
      "href",
      "/signin"
    );
  });

  // 2. Input values
  it("should update email and password values", async () => {
    const user = userEvent.setup();

    renderSignup();

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  // 3. Required validation
  it("should show required error when fields are empty", async () => {
    const user = userEvent.setup();

    const { container } = renderSignup();

    // Disable browser native validation to test custom validation
    container.querySelector("form")?.setAttribute("novalidate", "");

    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Please fill in all fields"
    );

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  // 4. Successful signup
  it("should call signUp and show email confirmation message", async () => {
    const user = userEvent.setup();

    mockSignUp.mockResolvedValue({
      error: null,
    });

    renderSignup();

    await user.type(screen.getByLabelText("Email"), "test@example.com");

    await user.type(screen.getByLabelText("Password"), "password123");

    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
    });

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Please check your email to confirm your account"
    );
  });

  // 5. Password should be cleared after successful signup
  it("should clear password after successful signup", async () => {
    const user = userEvent.setup();

    mockSignUp.mockResolvedValue({
      error: null,
    });

    renderSignup();

    await user.type(screen.getByLabelText("Email"), "test@example.com");

    await user.type(screen.getByLabelText("Password"), "password123");

    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await screen.findByRole("status");

    expect(screen.getByLabelText("Password")).toHaveValue("");
  });

  // 6. Inputs and button should be disabled after success
  it("should disable form after successful signup", async () => {
    const user = userEvent.setup();

    mockSignUp.mockResolvedValue({
      error: null,
    });

    renderSignup();

    await user.type(screen.getByLabelText("Email"), "test@example.com");

    await user.type(screen.getByLabelText("Password"), "password123");

    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await screen.findByRole("status");

    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(screen.getByLabelText("Password")).toBeDisabled();

    expect(screen.getByRole("button", { name: "Sign Up" })).toBeDisabled();
  });

  // 7. Supabase signup error
  it("should show signup failed error when signUp returns an error", async () => {
    const user = userEvent.setup();

    mockSignUp.mockResolvedValue({
      error: {
        message: "User already registered",
      },
    });

    renderSignup();

    await user.type(screen.getByLabelText("Email"), "existing@example.com");

    await user.type(screen.getByLabelText("Password"), "password123");

    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Registration failed"
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  // 8. Generic error
  it("should show generic error when signUp throws an exception", async () => {
    const user = userEvent.setup();

    mockSignUp.mockRejectedValue(new Error("Network error"));

    renderSignup();

    await user.type(screen.getByLabelText("Email"), "test@example.com");

    await user.type(screen.getByLabelText("Password"), "password123");

    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Something went wrong"
    );
  });

  // 9. Loading state
  it("should show loading state while signup is processing", async () => {
    const user = userEvent.setup();

    let resolveSignUp!: (value: { error: null }) => void;

    mockSignUp.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSignUp = resolve;
        })
    );

    renderSignup();

    await user.type(screen.getByLabelText("Email"), "test@example.com");

    await user.type(screen.getByLabelText("Password"), "password123");

    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(
      await screen.findByRole("button", { name: "Loading..." })
    ).toBeDisabled();

    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(screen.getByLabelText("Password")).toBeDisabled();

    resolveSignUp({ error: null });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Sign Up" })).toBeDisabled();
    });

    expect(await screen.findByRole("status")).toBeInTheDocument();
  });

  // 10. Loading should reset after error
  it("should enable form again after signup fails", async () => {
    const user = userEvent.setup();

    mockSignUp.mockRejectedValue(new Error("Network error"));

    renderSignup();

    await user.type(screen.getByLabelText("Email"), "test@example.com");

    await user.type(screen.getByLabelText("Password"), "password123");

    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await screen.findByRole("alert");

    expect(screen.getByLabelText("Email")).toBeEnabled();
    expect(screen.getByLabelText("Password")).toBeEnabled();

    expect(screen.getByRole("button", { name: "Sign Up" })).toBeEnabled();
  });

  // 11. Native validation attributes
  it("should have correct native validation attributes", () => {
    renderSignup();

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    expect(emailInput).toBeRequired();
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("autoComplete", "email");

    expect(passwordInput).toBeRequired();
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("minLength", "8");
    expect(passwordInput).toHaveAttribute("autoComplete", "new-password");
  });

  // 12. Signup should not navigate to dashboard
  it("should not navigate after successful signup", async () => {
    const user = userEvent.setup();

    mockSignUp.mockResolvedValue({
      error: null,
    });

    renderSignup();

    await user.type(screen.getByLabelText("Email"), "test@example.com");

    await user.type(screen.getByLabelText("Password"), "password123");

    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await screen.findByRole("status");

    expect(window.location.pathname).toBe("/");
  });
});
