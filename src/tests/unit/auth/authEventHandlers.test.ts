
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAuthStateChangeHandler, useInitialSessionCheck } from "@/hooks/auth/authEventHandlers";
import { APP_STATE } from "@/integrations/supabase/client";
import { resetAuthMocks, setupAuthMocks, getMockSession, getMockUser } from "./__mocks__/authMocks";

describe("authEventHandlers", () => {
  beforeEach(() => {
    vi.mock("react-router-dom", () => ({
      useNavigate: vi.fn().mockReturnValue(vi.fn()),
      useLocation: vi.fn().mockReturnValue({
        pathname: "/test",
        search: "?mode=cloud&client=true",
      }),
    }));
  });

  afterEach(() => {
    resetAuthMocks();
  });

  describe("useAuthStateChangeHandler", () => {
    it("should handle sign-in events", async () => {
      const navigate = vi.fn();
      vi.mock("react-router-dom", () => ({
        useNavigate: vi.fn().mockReturnValue(navigate),
        useLocation: vi.fn().mockReturnValue({
          pathname: "/auth",
          search: "",
        }),
      }));

      setupAuthMocks({
        profileQueryReturn: { 
          data: { id: "test-user", is_first_login: true }, 
          error: null 
        },
        configQueryReturn: { 
          data: [], 
          error: null 
        }
      });

      const handler = useAuthStateChangeHandler();
      const mockSession = getMockSession();
      
      await handler('SIGNED_IN', mockSession);
      
      expect(navigate).toHaveBeenCalled();
    });

    it("should handle sign-out events", async () => {
      const navigate = vi.fn();
      vi.mock("react-router-dom", () => ({
        useNavigate: vi.fn().mockReturnValue(navigate),
        useLocation: vi.fn().mockReturnValue({
          pathname: "/chat", // Protected route
          search: "",
        }),
      }));

      const handler = useAuthStateChangeHandler();
      
      await handler('SIGNED_OUT', null);
      
      expect(navigate).toHaveBeenCalled();
    });

    it("should handle offline mode correctly", async () => {
      const originalOfflineMode = APP_STATE.isOfflineMode;
      APP_STATE.isOfflineMode = true;
      
      const handler = useAuthStateChangeHandler();
      const result = await handler('SIGNED_IN', getMockSession());
      
      expect(result).toBeNull();
      
      // Restore original state
      APP_STATE.isOfflineMode = originalOfflineMode;
    });
  });

  describe("useInitialSessionCheck", () => {
    it("should check for existing session", async () => {
      const mockSession = getMockSession();
      setupAuthMocks({
        getSessionReturn: { data: { session: mockSession }, error: null },
        profileQueryReturn: { 
          data: { id: mockSession.user.id, is_first_login: false }, 
          error: null 
        },
        configQueryReturn: { 
          data: [{ service_type: "google_drive", status: "configured" }], 
          error: null 
        }
      });

      const checkSession = useInitialSessionCheck();
      await checkSession();
      
      expect(APP_STATE.setOfflineMode).not.toHaveBeenCalled();
    });

    it("should handle errors and potentially set offline mode", async () => {
      setupAuthMocks({
        getSessionReturn: { 
          data: { session: null }, 
          error: new Error("Failed to fetch") 
        }
      });

      const checkSession = useInitialSessionCheck();
      
      try {
        await checkSession();
      } catch (error) {
        // Error is expected
      }
      
      // Should enable offline mode for network errors
      expect(APP_STATE.setOfflineMode).toHaveBeenCalledWith(true);
    });

    it("should handle offline mode", async () => {
      const originalOfflineMode = APP_STATE.isOfflineMode;
      APP_STATE.isOfflineMode = true;
      
      const navigate = vi.fn();
      vi.mock("react-router-dom", () => ({
        useNavigate: vi.fn().mockReturnValue(navigate),
        useLocation: vi.fn().mockReturnValue({
          pathname: "/chat", // Protected route
          search: "",
        }),
      }));
      
      const checkSession = useInitialSessionCheck();
      await checkSession();
      
      // Should redirect from protected routes in offline mode
      expect(navigate).toHaveBeenCalled();
      
      // Restore original state
      APP_STATE.isOfflineMode = originalOfflineMode;
    });
  });
});
