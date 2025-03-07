
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleProfileAndConfig } from "@/hooks/auth/profile/profileUtils";
import { resetAuthMocks, setupAuthMocks } from "./__mocks__/authMocks";

describe("profileUtils", () => {
  beforeEach(() => {
    vi.mock("react-router-dom", () => ({
      useNavigate: vi.fn().mockReturnValue(vi.fn()),
      useLocation: vi.fn().mockReturnValue({
        pathname: "/test",
        search: "?mode=cloud&client=true",
        hash: "",
        state: null,
        key: "default",
      }),
    }));
  });

  afterEach(() => {
    resetAuthMocks();
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
});
