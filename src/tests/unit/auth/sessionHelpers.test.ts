
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useNavigationHelpers } from "@/hooks/auth/navigation/navigationHelpers";
import { handleProfileAndConfig } from "@/hooks/auth/profile/profileUtils";
import { handleUserRedirection, checkRouteProtection } from "@/hooks/auth/redirection/redirectionUtils";
import { isPublicPagePath, isAuthPagePath } from "@/hooks/auth/routes/routeHelpers";
import { resetAuthMocks, setupAuthMocks } from "./__mocks__/authMocks";
import { Location, NavigateFunction } from "react-router-dom";

// Create a more complete mock location that satisfies the Location interface
const createMockLocation = (pathname: string): Location => ({
  pathname,
  search: "?mode=cloud&client=true",
  hash: "",
  state: null,
  key: "default",
});

describe("sessionHelpers", () => {
  beforeEach(() => {
    vi.mock("react-router-dom", () => ({
      useNavigate: vi.fn().mockReturnValue(vi.fn()),
      useLocation: vi.fn().mockReturnValue(createMockLocation("/test")),
    }));
  });

  afterEach(() => {
    resetAuthMocks();
  });

  describe("useNavigationHelpers", () => {
    it("should return navigation helper functions", () => {
      const helpers = useNavigationHelpers();
      
      expect(helpers.navigate).toBeDefined();
      expect(helpers.location).toBeDefined();
      expect(helpers.getUrlParams).toBeDefined();
      expect(helpers.getNavigationPath).toBeDefined();
    });

    it("should parse URL parameters correctly", () => {
      const { getUrlParams } = useNavigationHelpers();
      const params = getUrlParams();
      
      expect(params.mode).toBe("cloud");
      expect(params.client).toBe(true);
    });

    it("should generate navigation paths with preserved URL parameters", () => {
      const { getNavigationPath } = useNavigationHelpers();
      const path = getNavigationPath("/chat");
      
      expect(path).toContain("/chat?");
      expect(path).toContain("mode=");
      expect(path).toContain("client=");
    });
  });

  describe("handleProfileAndConfig", () => {
    it("should return profile and configuration status", async () => {
      setupAuthMocks({
        profileQueryReturn: { 
          data: { id: "test-user", is_first_login: true }, 
          error: null 
        },
        configQueryReturn: { 
          data: [{ service_type: "google_drive", status: "configured" }], 
          error: null 
        }
      });

      const result = await handleProfileAndConfig("test-user");
      
      expect(result.profile).toBeDefined();
      expect(result.profile?.is_first_login).toBe(true);
      expect(result.configs).toBeDefined();
      expect(result.needsConfig).toBe(false);
      expect(result.isFirstLogin).toBe(true);
    });

    it("should handle profile retrieval errors", async () => {
      setupAuthMocks({
        profileQueryReturn: { 
          data: null, 
          error: new Error("Profile not found") 
        }
      });

      const result = await handleProfileAndConfig("test-user");
      
      expect(result.profileError).toBeDefined();
      expect(result.profile).toBeNull();
    });

    it("should correctly determine if config is needed", async () => {
      // No configured services
      setupAuthMocks({
        profileQueryReturn: { data: { id: "test-user" }, error: null },
        configQueryReturn: { 
          data: [{ service_type: "google_drive", status: "pending" }], 
          error: null 
        }
      });

      const result = await handleProfileAndConfig("test-user");
      expect(result.needsConfig).toBe(true);

      // With configured services
      setupAuthMocks({
        profileQueryReturn: { data: { id: "test-user" }, error: null },
        configQueryReturn: { 
          data: [{ service_type: "google_drive", status: "configured" }], 
          error: null 
        }
      });

      const result2 = await handleProfileAndConfig("test-user");
      expect(result2.needsConfig).toBe(false);
    });
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

  describe("isPublicPagePath", () => {
    it("should identify public pages correctly", () => {
      expect(isPublicPagePath("/")).toBe(true);
      expect(isPublicPagePath("/landing")).toBe(true);
      expect(isPublicPagePath("/landing/features")).toBe(true);
      expect(isPublicPagePath("/home")).toBe(true);
      expect(isPublicPagePath("/index")).toBe(true);
      
      expect(isPublicPagePath("/chat")).toBe(false);
      expect(isPublicPagePath("/config")).toBe(false);
      expect(isPublicPagePath("/documents")).toBe(false);
    });
  });

  describe("isAuthPagePath", () => {
    it("should identify auth pages correctly", () => {
      expect(isAuthPagePath("/auth")).toBe(true);
      expect(isAuthPagePath("/auth/login")).toBe(true);
      expect(isAuthPagePath("/auth/register")).toBe(true);
      
      expect(isAuthPagePath("/")).toBe(false);
      expect(isAuthPagePath("/chat")).toBe(false);
      expect(isAuthPagePath("/config")).toBe(false);
    });
  });
});
