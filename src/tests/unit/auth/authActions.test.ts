
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useSignOut } from "@/hooks/auth/authActions";
import { resetAuthMocks, setupAuthMocks } from "./__mocks__/authMocks";
import { toast } from "@/hooks/use-toast";

describe("authActions", () => {
  beforeEach(() => {
    vi.mock("react-router-dom", () => ({
      useNavigate: vi.fn().mockReturnValue(vi.fn()),
    }));
  });

  afterEach(() => {
    resetAuthMocks();
  });

  describe("useSignOut", () => {
    it("should sign out user successfully", async () => {
      const navigate = vi.fn();
      vi.mock("react-router-dom", () => ({
        useNavigate: vi.fn().mockReturnValue(navigate),
      }));
      
      setupAuthMocks({
        signOutReturn: { error: null }
      });

      const signOut = useSignOut();
      await signOut();
      
      expect(navigate).toHaveBeenCalledWith("/");
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Déconnexion réussie"
      }));
    });

    it("should handle sign out errors", async () => {
      setupAuthMocks({
        signOutReturn: { error: new Error("Sign out failed") }
      });

      const signOut = useSignOut();
      await signOut();
      
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Erreur",
        variant: "destructive"
      }));
    });
  });
});
