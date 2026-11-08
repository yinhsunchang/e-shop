import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  type InitialEntry,
} from "react-router-dom";
import Signin from "./SigninSupa";

// Mock useAuth
const mockSignIn = vi.fn();

vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    signIn: mockSignIn,
  }),
}));

// Mock translations
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "signin.title": "Sign In",
        "signin.email": "Email",
        "signin.password": "Password",
        "signin.emailPlaceholder": "Enter your email",
        "signin.passwordPlaceholder": "Enter your password",
        "signin.required": "Please fill in all fields",
        "signin.invalidCredentials": "Invalid email or password",
        "signin.genericError": "Something went wrong",
        "signin.loading": "Loading...",
        "signin.signin": "Sign In",
        "signin.notyet": "Not yet registered?",
        "signin.signup": "Sign Up",
      };

      return translations[key] ?? key;
    },
  }),
}));

// Helper component to check navigation
function LocationDisplay() {
  const location = useLocation();

  return <div data-testid="current-path">{location.pathname}</div>;
}

// Render helper
function renderSignin(initialEntries: InitialEntry[] = ["/signin"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/signin" element={<Signin />} />
        <Route path="*" element={<LocationDisplay />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Signin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Basic rendering
  it("should render signin form correctly", () => {
    renderSignin();

    expect(
      screen.getByRole("heading", { name: "Sign In" })
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Email")).toBeInTheDocument();

    expect(screen.getByLabelText("Password")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Sign Up" })).toHaveAttribute(
      "href",
      "/signup"
    );
  });

  // 2. Input values
  it("should update email and password values", async () => {
    const user = userEvent.setup();

    renderSignin();

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  // 3. Required validation

  it("should require email and password fields", () => {
    renderSignin();

    expect(screen.getByLabelText("Email")).toBeRequired();
    expect(screen.getByLabelText("Password")).toBeRequired();

    expect(screen.getByLabelText("Password")).toHaveAttribute("minLength", "8");
  });

  it("should show required error when fields are empty", async () => {
    const user = userEvent.setup();

    const { container } = renderSignin();

    // Disable browser native validation for this test
    container.querySelector("form")?.setAttribute("novalidate", "");

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Please fill in all fields"
    );

    expect(mockSignIn).not.toHaveBeenCalled();
  });

  // 4. Successful signin
  it("should call signIn and navigate to home on success", async () => {
    const user = userEvent.setup();

    mockSignIn.mockResolvedValue({ error: null });

    renderSignin();

    await user.type(screen.getByLabelText("Email"), "test@example.com");

    await user.type(screen.getByLabelText("Password"), "password123");

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
    });

    expect(await screen.findByTestId("current-path")).toHaveTextContent("/");
  });

  // 5. Navigate to original destination
  it("should navigate to the original page after successful signin", async () => {
    const user = userEvent.setup();

    mockSignIn.mockResolvedValue({ error: null });

    renderSignin([
      {
        pathname: "/signin",
        state: {
          from: {
            pathname: "/dashboard",
          },
        },
      },
    ]);

    await user.type(screen.getByLabelText("Email"), "test@example.com");

    await user.type(screen.getByLabelText("Password"), "password123");

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByTestId("current-path")).toHaveTextContent(
      "/dashboard"
    );
  });

  // 6. Invalid credentials
  it("should show invalid credentials error when signin fails", async () => {
    const user = userEvent.setup();

    mockSignIn.mockResolvedValue({
      error: { message: "Invalid credentials" },
    });

    renderSignin();

    await user.type(screen.getByLabelText("Email"), "wrong@example.com");

    await user.type(screen.getByLabelText("Password"), "wrongpassword");

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid email or password"
    );

    // expect(screen.getByTestId("current-path")).toBeUndefined();
    expect(screen.queryByTestId("current-path")).not.toBeInTheDocument();
  });

  // 7. Generic error
  it("should show generic error when signIn throws an exception", async () => {
    const user = userEvent.setup();

    mockSignIn.mockRejectedValue(new Error("Network error"));

    renderSignin();

    await user.type(screen.getByLabelText("Email"), "test@example.com");

    await user.type(screen.getByLabelText("Password"), "password123");

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Something went wrong"
    );
  });

  // 8. Loading state
  it("should show loading state while signin is processing", async () => {
    const user = userEvent.setup();

    let resolveSignIn!: (value: { error: null }) => void;

    mockSignIn.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSignIn = resolve;
        })
    );

    renderSignin();

    await user.type(screen.getByLabelText("Email"), "test@example.com");

    await user.type(screen.getByLabelText("Password"), "password123");

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(
      await screen.findByRole("button", { name: "Loading..." })
    ).toBeDisabled();

    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(screen.getByLabelText("Password")).toBeDisabled();

    resolveSignIn({ error: null });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Sign In" })).toBeEnabled();
    });
  });

  // 9. Invalid redirect path: protocol-relative URL
  it("should redirect to home instead of an unsafe external path", async () => {
    const user = userEvent.setup();

    mockSignIn.mockResolvedValue({ error: null });

    renderSignin([
      {
        pathname: "/signin",
        state: {
          from: {
            pathname: "//evil.com",
          },
        },
      },
    ]);

    await user.type(screen.getByLabelText("Email"), "test@example.com");

    await user.type(screen.getByLabelText("Password"), "password123");

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByTestId("current-path")).toHaveTextContent("/");
  });

  // 10. Invalid redirect path: non-relative path
  it("should redirect to home when from pathname is not absolute", async () => {
    const user = userEvent.setup();

    mockSignIn.mockResolvedValue({ error: null });

    renderSignin([
      {
        pathname: "/signin",
        state: {
          from: {
            pathname: "https://evil.com",
          },
        },
      },
    ]);

    await user.type(screen.getByLabelText("Email"), "test@example.com");

    await user.type(screen.getByLabelText("Password"), "password123");

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByTestId("current-path")).toHaveTextContent("/");
  });
});
