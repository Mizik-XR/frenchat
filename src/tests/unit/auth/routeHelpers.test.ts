import { describe, it, expect } from '@jest/globals';
import { isPublicPagePath, isAuthPagePath } from "@/hooks/auth/routes/routeHelpers";
import { getRedirectPath } from '@/utils/auth/routeHelpers';

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

describe('getRedirectPath', () => {
  it('should return the default path when no redirect is provided', () => {
    expect(getRedirectPath()).toBe('/');
  });

  it('should return the provided redirect path', () => {
    const redirectPath = '/dashboard';
    expect(getRedirectPath(redirectPath)).toBe(redirectPath);
  });

  it('should handle empty redirect path', () => {
    expect(getRedirectPath('')).toBe('/');
  });

  it('should handle undefined redirect path', () => {
    expect(getRedirectPath(undefined)).toBe('/');
  });

  it('should handle null redirect path', () => {
    expect(getRedirectPath(null)).toBe('/');
  });
});
