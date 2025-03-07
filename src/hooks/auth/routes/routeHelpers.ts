
/**
 * Vérifie si un chemin correspond à une page publique
 */
export const isPublicPagePath = (pathname: string): boolean => {
  const publicPaths = ["/", "/landing", "/home", "/index"];
  return publicPaths.some(path => pathname === path || pathname.startsWith(`${path}/`));
};

/**
 * Vérifie si un chemin correspond à une page d'authentification
 */
export const isAuthPagePath = (pathname: string): boolean => {
  return pathname === "/auth" || pathname.startsWith("/auth/");
};
