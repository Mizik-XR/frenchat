
import { describe, it, expect } from "vitest";
import {
  PROTECTED_ROUTES,
  isProtectedRoute,
  MAX_SESSION_DURATION,
  REFRESH_SESSION_BEFORE_EXPIRY,
  AUTH_ERRORS,
  OAUTH_ROUTES
} from "@/hooks/auth/authConstants";

describe("authConstants", () => {
  describe("PROTECTED_ROUTES", () => {
    it("should contain the essential protected routes", () => {
      expect(PROTECTED_ROUTES).toContain("/chat");
      expect(PROTECTED_ROUTES).toContain("/config");
      expect(PROTECTED_ROUTES).toContain("/documents");
    });
  });

  describe("isProtectedRoute", () => {
    it("should return true for protected routes", () => {
      expect(isProtectedRoute("/chat")).toBe(true);
      expect(isProtectedRoute("/config/advanced")).toBe(true);
      expect(isProtectedRoute("/documents/123")).toBe(true);
    });

    it("should return false for non-protected routes", () => {
      expect(isProtectedRoute("/")).toBe(false);
      expect(isProtectedRoute("/auth")).toBe(false);
      expect(isProtectedRoute("/landing")).toBe(false);
    });
  });

  describe("Session constants", () => {
    it("should have valid session duration values", () => {
      expect(MAX_SESSION_DURATION).toBeGreaterThan(0);
      expect(REFRESH_SESSION_BEFORE_EXPIRY).toBeGreaterThan(0);
      expect(MAX_SESSION_DURATION).toBeGreaterThan(REFRESH_SESSION_BEFORE_EXPIRY);
    });
  });

  describe("AUTH_ERRORS", () => {
    it("should have error messages for common auth scenarios", () => {
      expect(AUTH_ERRORS.SESSION_EXPIRED).toBeDefined();
      expect(AUTH_ERRORS.INVALID_CREDENTIALS).toBeDefined();
      expect(AUTH_ERRORS.NETWORK_ERROR).toBeDefined();
    });
  });

  describe("OAUTH_ROUTES", () => {
    it("should define OAuth callback routes", () => {
      expect(OAUTH_ROUTES.GOOGLE_CALLBACK).toBeDefined();
      expect(OAUTH_ROUTES.MICROSOFT_CALLBACK).toBeDefined();
      expect(OAUTH_ROUTES.SUPABASE_CALLBACK).toBeDefined();
    });
  });
});
