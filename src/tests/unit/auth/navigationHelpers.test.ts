
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useNavigationHelpers } from "@/hooks/auth/navigation/navigationHelpers";
import { resetAuthMocks } from "./__mocks__/authMocks";
import { Location } from "react-router-dom";

// Create a more complete mock location that satisfies the Location interface
const createMockLocation = (pathname: string): Location => ({
  pathname,
  search: "?mode=cloud&client=true",
  hash: "",
  state: null,
  key: "default",
});

describe("navigationHelpers", () => {
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
});
