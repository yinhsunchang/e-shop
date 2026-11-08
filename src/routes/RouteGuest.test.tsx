import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";

import RouteGuest from "./RouteGuest";
import { useAuth } from "@/auth/useAuth";

vi.mock("@/auth/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockedUseAuth = vi.mocked(useAuth);

// Test pages
function LoginPage() {
  return <div>Login Page</div>;
}

function DashboardPage() {
  return <div>Dashboard Page</div>;
}

function PreviousPage() {
  return <div>Previous Page</div>;
}

function BackButton() {
  const navigate = useNavigate();

  return <button onClick={() => navigate(-1)}>Go Back</button>;
}

// Test render helper
function renderRouteGuest(initialEntries = ["/login"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route element={<RouteGuest />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route path="/admin/dashboard" element={<DashboardPage />} />

        <Route path="/previous" element={<PreviousPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("RouteGuest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display loading when auth is initializing", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      loading: true,
    } as ReturnType<typeof useAuth>);

    renderRouteGuest();

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("loading")).toBeInTheDocument();

    expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
  });

  it("should redirect authenticated users to dashboard", () => {
    mockedUseAuth.mockReturnValue({
      user: { id: "1" },
      loading: false,
    } as ReturnType<typeof useAuth>);

    renderRouteGuest();

    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();

    expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
  });

  it("should render Outlet when user is not authenticated", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      loading: false,
    } as ReturnType<typeof useAuth>);

    renderRouteGuest();

    expect(screen.getByText("Login Page")).toBeInTheDocument();

    expect(screen.queryByText("Dashboard Page")).not.toBeInTheDocument();
  });

  it("should replace history when redirecting authenticated users", async () => {
    const user = userEvent.setup();

    mockedUseAuth.mockReturnValue({
      user: { id: "1" },
      loading: false,
    } as ReturnType<typeof useAuth>);

    render(
      <MemoryRouter initialEntries={["/previous", "/login"]} initialIndex={1}>
        <Routes>
          <Route element={<RouteGuest />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route
            path="/admin/dashboard"
            element={
              <>
                <DashboardPage />
                <BackButton />
              </>
            }
          />

          <Route path="/previous" element={<PreviousPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Go Back" }));

    expect(screen.getByText("Previous Page")).toBeInTheDocument();
  });
});
