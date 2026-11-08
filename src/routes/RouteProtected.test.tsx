import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";

import RouteProtected from "./RouteProtected";
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

function SigninPage() {
  const location = useLocation();

  return (
    <div>
      <h1>Signin Page</h1>
      <p data-testid="pathname">{location.pathname}</p>
      <p data-testid="from">{location.state?.from?.pathname || ""}</p>
    </div>
  );
}

function renderRoute(initialEntry = "/dashboard") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/signin" element={<SigninPage />} />

        <Route element={<RouteProtected />}>
          <Route path="/dashboard" element={<h1>Dashboard Page</h1>} />
          <Route path="/profile" element={<h1>Profile Page</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("RouteProtected", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display loading when authentication is loading", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      loading: true,
    } as ReturnType<typeof useAuth>);

    renderRoute();

    expect(screen.getByRole("status")).toBeInTheDocument();

    expect(screen.getByText("routeProtected.loading")).toBeInTheDocument();

    expect(screen.queryByText("Dashboard Page")).not.toBeInTheDocument();
  });

  it("should redirect to signin when user is not authenticated", async () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      loading: false,
    } as ReturnType<typeof useAuth>);

    renderRoute();

    expect(
      await screen.findByRole("heading", {
        name: "Signin Page",
      })
    ).toBeInTheDocument();

    expect(screen.getByTestId("pathname")).toHaveTextContent("/signin");
  });

  it("should preserve the original pathname when redirecting", async () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      loading: false,
    } as ReturnType<typeof useAuth>);

    renderRoute("/dashboard");

    expect(await screen.findByTestId("from")).toHaveTextContent("/dashboard");
  });

  it("should render the protected page when user is authenticated", () => {
    mockedUseAuth.mockReturnValue({
      user: { id: "user-123" },
      loading: false,
    } as ReturnType<typeof useAuth>);

    renderRoute();

    expect(
      screen.getByRole("heading", {
        name: "Dashboard Page",
      })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Signin Page",
      })
    ).not.toBeInTheDocument();
  });

  it("should not redirect while authentication is loading", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      loading: true,
    } as ReturnType<typeof useAuth>);

    renderRoute();

    expect(
      screen.queryByRole("heading", {
        name: "Signin Page",
      })
    ).not.toBeInTheDocument();
  });

  it("should protect different nested routes", async () => {
    mockedUseAuth.mockReturnValue({
      user: { id: "user-123" },
      loading: false,
    } as ReturnType<typeof useAuth>);

    renderRoute("/profile");

    expect(
      screen.getByRole("heading", {
        name: "Profile Page",
      })
    ).toBeInTheDocument();
  });
});
