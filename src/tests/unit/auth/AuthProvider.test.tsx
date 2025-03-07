
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { resetAuthMocks } from "./__mocks__/authMocks";

// Mock useAuthSession hook
vi.mock("@/hooks/useAuthSession", () => ({
  useAuthSession: vi.fn().mockReturnValue({
    user: null,
    isLoading: false,
    signOut: vi.fn(),
    isOfflineMode: false,
    toggleOfflineMode: vi.fn(),
  })
}));

// Create a test component that uses the useAuth hook
const TestComponent = () => {
  const { user, signOut } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">
        {user ? "Authenticated" : "Not Authenticated"}
      </div>
      <button data-testid="sign-out" onClick={signOut}>
        Sign Out
      </button>
    </div>
  );
};

describe("AuthProvider", () => {
  beforeEach(() => {
    resetAuthMocks();
  });

  it("should render children when not loading", () => {
    render(
      <AuthProvider>
        <div data-testid="child-component">Child Component</div>
      </AuthProvider>
    );
    
    expect(screen.getByTestId("child-component")).toBeInTheDocument();
  });

  it("should render loading screen when loading", () => {
    // Update the mock to return isLoading: true
    vi.mocked(useAuthSession).mockReturnValue({
      user: null,
      isLoading: true,
      signOut: vi.fn(),
      isOfflineMode: false,
      toggleOfflineMode: vi.fn(),
    });
    
    render(
      <AuthProvider>
        <div data-testid="child-component">Child Component</div>
      </AuthProvider>
    );
    
    // The LoadingScreen component is rendered instead of children
    expect(screen.queryByTestId("child-component")).not.toBeInTheDocument();
  });

  it("should provide auth context to children", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId("auth-status")).toHaveTextContent("Not Authenticated");
    expect(screen.getByTestId("sign-out")).toBeInTheDocument();
  });

  it("should throw error when useAuth is used outside AuthProvider", () => {
    // Mock console.error to suppress React's error logging
    const originalError = console.error;
    console.error = vi.fn();
    
    // Expect error when rendering TestComponent without AuthProvider
    expect(() => render(<TestComponent />)).toThrow();
    
    // Restore console.error
    console.error = originalError;
  });
});
