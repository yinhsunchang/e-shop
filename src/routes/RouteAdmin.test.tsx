import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import RouteAdmin from "./RouteAdmin";
import { useAuth } from "@/auth/useAuth";

// Mock useAuth
vi.mock("@/auth/useAuth", () => ({
  useAuth: vi.fn(),
}));

// Mock translations
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockedUseAuth = vi.mocked(useAuth);

type AuthContextType = ReturnType<typeof useAuth>;

const mockAuth = (overrides: Partial<AuthContextType> = {}) => {
  const defaultAuth: AuthContextType = {
    user: null,
    profile: null,
    loading: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  };

  mockedUseAuth.mockReturnValue({
    ...defaultAuth,
    ...overrides,
  });
};

function renderRoute(initialEntry = "/admin") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/signin" element={<h1>Signin Page</h1>} />

        <Route path="/user/account" element={<h1>User Account Page</h1>} />

        <Route element={<RouteAdmin />}>
          <Route path="/admin" element={<h1>Admin Dashboard</h1>} />

          <Route path="/admin/users" element={<h1>Admin Users</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("RouteAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display loading when authentication is loading", () => {
    mockAuth({
      loading: true,
    });

    renderRoute();

    expect(screen.getByRole("status")).toBeInTheDocument();

    expect(screen.getByText("routeProtected.loading")).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Admin Dashboard",
      })
    ).not.toBeInTheDocument();
  });

  it("should redirect to signin when user is not authenticated", () => {
    mockAuth({
      user: null,
      profile: null,
    });

    renderRoute();

    expect(
      screen.getByRole("heading", {
        name: "Signin Page",
      })
    ).toBeInTheDocument();
  });

  it("should redirect to user account when profile is null", () => {
    mockedUseAuth.mockReturnValue({
      user: { id: "user-123" },
      profile: null,
      loading: false,
    } as ReturnType<typeof useAuth>);

    renderRoute();

    expect(
      screen.getByRole("heading", {
        name: "User Account Page",
      })
    ).toBeInTheDocument();
  });

  it("should redirect to user account when user is not an admin", () => {
    mockedUseAuth.mockReturnValue({
      user: { id: "user-123" },
      profile: {
        role: "customer",
      },
      loading: false,
    } as ReturnType<typeof useAuth>);

    renderRoute();

    expect(
      screen.getByRole("heading", {
        name: "User Account Page",
      })
    ).toBeInTheDocument();
  });

  it("should redirect to user account when profile role is manager", () => {
    mockedUseAuth.mockReturnValue({
      user: { id: "user-123" },
      profile: {
        role: "customer",
      },
      loading: false,
    } as ReturnType<typeof useAuth>);

    renderRoute();

    expect(
      screen.getByRole("heading", {
        name: "User Account Page",
      })
    ).toBeInTheDocument();
  });

  it("should render admin dashboard when user is an admin", () => {
    mockedUseAuth.mockReturnValue({
      user: { id: "admin-123" },
      profile: {
        role: "admin",
      },
      loading: false,
    } as ReturnType<typeof useAuth>);

    renderRoute();

    expect(
      screen.getByRole("heading", {
        name: "Admin Dashboard",
      })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Signin Page",
      })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "User Account Page",
      })
    ).not.toBeInTheDocument();
  });

  it("should allow admin to access nested admin routes", () => {
    mockedUseAuth.mockReturnValue({
      user: { id: "admin-123" },
      profile: {
        role: "admin",
      },
      loading: false,
    } as ReturnType<typeof useAuth>);

    renderRoute("/admin/users");

    expect(
      screen.getByRole("heading", {
        name: "Admin Users",
      })
    ).toBeInTheDocument();
  });
});
