import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./Dashboard";

// Mock dependencies
const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  signOut: vi.fn(),
  maybeSingle: vi.fn(),
}));

vi.mock("@/auth/useAuth", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: mocks.maybeSingle,
        })),
      })),
    })),
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Test data
const mockUser = {
  id: "user-123",
  email: "test@example.com",
};

const mockProfile = {
  id: "user-123",
  email: "test@example.com",
  display_name: "Test User",
  role: "admin",
};

// Render helper
function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
}

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useAuth.mockReturnValue({
      user: mockUser,
      signOut: mocks.signOut,
      loading: false,
    });

    mocks.signOut.mockResolvedValue(undefined);

    mocks.maybeSingle.mockResolvedValue({
      data: mockProfile,
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------
  // Auth Loading
  // -------------------------

  it("should display loading when authentication is loading", () => {
    mocks.useAuth.mockReturnValue({
      user: null,
      signOut: mocks.signOut,
      loading: true,
    });

    renderDashboard();

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("loading")).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "dashboard.title",
      })
    ).not.toBeInTheDocument();
  });

  // -------------------------
  // Dashboard Rendering
  // -------------------------

  it("should render the dashboard title and profile section", async () => {
    renderDashboard();

    expect(
      screen.getByRole("heading", {
        name: "dashboard.title",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "dashboard.profile",
      })
    ).toBeInTheDocument();

    expect(
      await screen.findByText("dashboard.nameTest User")
    ).toBeInTheDocument();
  });

  // -------------------------
  // Profile
  // -------------------------

  it("should fetch and display the user profile", async () => {
    renderDashboard();

    expect(
      await screen.findByText("dashboard.emailtest@example.com")
    ).toBeInTheDocument();

    expect(screen.getByText("dashboard.nameTest User")).toBeInTheDocument();

    expect(screen.getByText("dashboard.roleadmin")).toBeInTheDocument();

    expect(mocks.maybeSingle).toHaveBeenCalledOnce();
  });

  it("should handle a profile fetching error", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const mockError = new Error("Database error");

    mocks.maybeSingle.mockResolvedValue({
      data: null,
      error: mockError,
    });

    renderDashboard();

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        "Failed to fetch profile:",
        mockError
      );
    });

    expect(
      screen.getByRole("heading", {
        name: "dashboard.title",
      })
    ).toBeInTheDocument();
  });

  it("should not fetch profile when the user is not logged in", () => {
    mocks.useAuth.mockReturnValue({
      user: null,
      signOut: mocks.signOut,
      loading: false,
    });

    renderDashboard();

    expect(mocks.maybeSingle).not.toHaveBeenCalled();
  });

  // -------------------------
  // Dashboard Links
  // -------------------------

  it("should render all dashboard navigation links", () => {
    renderDashboard();

    expect(
      screen.getByRole("link", {
        name: "dashboard.productsLink",
      })
    ).toHaveAttribute("href", "/admin/products");

    expect(
      screen.getByRole("link", {
        name: "dashboard.ordersLink",
      })
    ).toHaveAttribute("href", "/admin/orders");

    expect(
      screen.getByRole("link", {
        name: "dashboard.subscribersLink",
      })
    ).toHaveAttribute("href", "/admin/subscribers");

    expect(
      screen.getByRole("link", {
        name: "dashboard.messagesLink",
      })
    ).toHaveAttribute("href", "/admin/messages");
  });

  // -------------------------
  // Sign Out
  // -------------------------

  it("should call signOut when the sign out button is clicked", async () => {
    const user = userEvent.setup();

    renderDashboard();

    const signOutButton = screen.getByRole("button", {
      name: "dashboard.signout",
    });

    await user.click(signOutButton);

    expect(mocks.signOut).toHaveBeenCalledOnce();
  });

  it("should disable the sign out button while signing out", async () => {
    const user = userEvent.setup();

    let resolveSignOut!: () => void;

    mocks.signOut.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSignOut = resolve;
      })
    );

    renderDashboard();

    const signOutButton = screen.getByRole("button", {
      name: "dashboard.signout",
    });

    await user.click(signOutButton);

    expect(signOutButton).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "dashboard.signingout",
      })
    ).toBeInTheDocument();

    resolveSignOut();

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "dashboard.signout",
        })
      ).toBeEnabled();
    });
  });

  it("should handle sign out errors", async () => {
    const user = userEvent.setup();

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const mockError = new Error("Sign out failed");

    mocks.signOut.mockRejectedValue(mockError);

    renderDashboard();

    const signOutButton = screen.getByRole("button", {
      name: "dashboard.signout",
    });

    await user.click(signOutButton);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith("Sign out failed:", mockError);
    });

    expect(
      screen.getByRole("button", {
        name: "dashboard.signout",
      })
    ).toBeEnabled();
  });
});
