
import { describe, it, expect } from "vitest";
import { isPublicPagePath, isAuthPagePath } from "@/hooks/auth/routes/routeHelpers";

describe("routeHelpers", () => {
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
