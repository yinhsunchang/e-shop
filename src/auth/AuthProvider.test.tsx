import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "@/lib/supabase";
import { AuthProvider } from "./AuthProvider";
import { useAuth } from "./useAuth";

import {
  AuthSessionMissingError,
  type Session,
  type Subscription,
  type User,
} from "@supabase/supabase-js";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock User
const mockUser = {
  id: "test-user-id",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as User;

// Mock Profile
const mockProfile = {
  id: "test-user-id",
  name: "Test User",
  email: "test@example.com",
} as never;

// Auth callback
type AuthCallback = Parameters<typeof supabase.auth.onAuthStateChange>[0];

let authStateCallback: AuthCallback | undefined;

// Mock subscription
function createMockSubscription(): Subscription {
  return {
    id: "test-subscription",
    callback: vi.fn(),
    unsubscribe: vi.fn(),
  };
}

// Mock authenticated user
function mockAuthenticatedUser() {
  vi.mocked(supabase.auth.getUser).mockResolvedValue({
    data: {
      user: mockUser,
    },
    error: null,
  });
}

// Mock unauthenticated user
function mockUnauthenticatedUser() {
  vi.mocked(supabase.auth.getUser).mockResolvedValue({
    data: {
      user: null,
    },
    error: new AuthSessionMissingError(),
  });
}

// Mock profile query
function mockProfileQuery(data: unknown = mockProfile, error: unknown = null) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
  };

  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);

  query.single.mockResolvedValue({
    data,
    error,
  });

  vi.mocked(supabase.from).mockReturnValue(query as never);

  return query;
}

// Test component
function TestConsumer() {
  const { user, profile, loading } = useAuth();

  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>

      <div data-testid="session">
        {user ? "authenticated" : "unauthenticated"}
      </div>

      <div data-testid="profile">
        {profile ? "profile-loaded" : "no-profile"}
      </div>
    </div>
  );
}

describe("AuthProvider", () => {
  let subscription: Subscription;

  beforeEach(() => {
    vi.clearAllMocks();

    subscription = createMockSubscription();
    authStateCallback = undefined;

    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(
      (callback) => {
        authStateCallback = callback;

        return {
          data: {
            subscription,
          },
        };
      }
    );

    // Default: unauthenticated
    mockUnauthenticatedUser();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Initialize authenticated user
  it("provides the current user after initialization", async () => {
    mockAuthenticatedUser();
    mockProfileQuery();

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");

      expect(screen.getByTestId("session")).toHaveTextContent("authenticated");

      expect(screen.getByTestId("profile")).toHaveTextContent("profile-loaded");
    });

    expect(supabase.auth.getUser).toHaveBeenCalledOnce();
    expect(supabase.from).toHaveBeenCalledWith("profiles");
  });

  // 2. Unauthenticated user
  it("provides null user when not authenticated", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("session")).toHaveTextContent("unauthenticated");

    expect(screen.getByTestId("profile")).toHaveTextContent("no-profile");

    expect(supabase.from).not.toHaveBeenCalled();
  });

  // 3. Auth initialization error
  it("handles getUser error", async () => {
    const error = new Error("Failed to get user");

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: {
        user: mockUser,
      },
      error: error as never,
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("session")).toHaveTextContent("unauthenticated");

    expect(consoleError).toHaveBeenCalledWith("Failed to get user:", error);
  });

  // 4. Profile loading error
  it("handles profile loading error", async () => {
    const error = {
      message: "Failed to load profile",
    };

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockAuthenticatedUser();
    mockProfileQuery(null, error);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("profiles");

      expect(consoleError).toHaveBeenCalledWith(
        "Failed to load profile:",
        error
      );
    });

    expect(screen.getByTestId("session")).toHaveTextContent("authenticated");

    expect(screen.getByTestId("profile")).toHaveTextContent("no-profile");

    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });

  // 5. Auth state changes
  it("updates user when auth state changes", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    mockProfileQuery();

    const session = {
      user: mockUser,
    } as Session;

    await act(async () => {
      await authStateCallback?.("SIGNED_IN", session);
    });

    await waitFor(() => {
      expect(screen.getByTestId("session")).toHaveTextContent("authenticated");

      expect(screen.getByTestId("profile")).toHaveTextContent("profile-loaded");
    });
  });

  // 6. Sign out
  it("clears user and profile when user signs out", async () => {
    mockAuthenticatedUser();
    mockProfileQuery();

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("profile")).toHaveTextContent("profile-loaded");
    });

    await act(async () => {
      await authStateCallback?.("SIGNED_OUT", null);
    });

    await waitFor(() => {
      expect(screen.getByTestId("session")).toHaveTextContent(
        "unauthenticated"
      );

      expect(screen.getByTestId("profile")).toHaveTextContent("no-profile");
    });
  });

  // 7. Subscription cleanup
  it("unsubscribes when component unmounts", () => {
    const { unmount } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    unmount();

    expect(subscription.unsubscribe).toHaveBeenCalledOnce();
  });
});
