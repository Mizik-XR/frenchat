
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleUserRedirection, checkRouteProtection } from "@/hooks/auth/redirection/redirectionUtils";
import { resetAuthMocks } from "./__mocks__/authMocks";
import { Location, NavigateFunction } from "react-router-dom";

// Create a more complete mock location that satisfies the Location interface
const createMockLocation = (pathname: string): Location => ({
  pathname,
  search: "?mode=cloud&client=true",
  hash: "",
  state: null,
  key: "default",
});

describe("redirectionUtils", () => {
  beforeEach(() => {
    vi.mock("react-router-dom", () => ({
      useNavigate: vi.fn().mockReturnValue(vi.fn()),
      useLocation: vi.fn().mockReturnValue(createMockLocation("/test")),
    }));
  });

  afterEach(() => {
    resetAuthMocks();
  });

  describe("handleUserRedirection", () => {
    it("should redirect first-time users to config page", () => {
      const navigate = vi.fn();
      const navigationHelpers = {
        navigate: navigate as NavigateFunction,
        location: createMockLocation("/auth"),
        getUrlParams: vi.fn(),
        getNavigationPath: vi.fn().mockReturnValue("/config?mode=cloud")
      };

      handleUserRedirection(true, true, true, navigationHelpers);
      
      expect(navigate).toHaveBeenCalledWith("/config?mode=cloud");
    });

    it("should redirect configured users to chat page", () => {
      const navigate = vi.fn();
      const navigationHelpers = {
        navigate: navigate as NavigateFunction,
        location: createMockLocation("/auth"),
        getUrlParams: vi.fn(),
        getNavigationPath: vi.fn().mockReturnValue("/chat?mode=cloud")
      };

      handleUserRedirection(true, false, false, navigationHelpers);
      
      expect(navigate).toHaveBeenCalledWith("/chat?mode=cloud");
    });

    it("should not redirect users on non-auth pages", () => {
      const navigate = vi.fn();
      const navigationHelpers = {
        navigate: navigate as NavigateFunction,
        location: createMockLocation("/chat"),
        getUrlParams: vi.fn(),
        getNavigationPath: vi.fn()
      };

      handleUserRedirection(false, true, true, navigationHelpers);
      
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe("checkRouteProtection", () => {
    it("should redirect unauthenticated users from protected routes", () => {
      const navigate = vi.fn();
      const navigationHelpers = {
        navigate: navigate as NavigateFunction,
        location: createMockLocation("/chat"),
        getUrlParams: vi.fn(),
        getNavigationPath: vi.fn().mockReturnValue("/auth?mode=cloud")
      };

      const redirected = checkRouteProtection(null, false, true, navigationHelpers);
      
      expect(redirected).toBe(true);
      expect(navigate).toHaveBeenCalledWith("/auth?mode=cloud", expect.anything());
    });

    it("should not redirect authenticated users from protected routes", () => {
      const navigate = vi.fn();
      const navigationHelpers = {
        navigate: navigate as NavigateFunction,
        location: createMockLocation("/chat"),
        getUrlParams: vi.fn(),
        getNavigationPath: vi.fn()
      };

      const redirected = checkRouteProtection({ user: { id: "test" } }, false, true, navigationHelpers);
      
      expect(redirected).toBe(false);
      expect(navigate).not.toHaveBeenCalled();
    });
  });
});
