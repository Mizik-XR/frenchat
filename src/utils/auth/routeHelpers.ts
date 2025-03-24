export function getRedirectPath(redirectPath?: string | null): string {
  if (!redirectPath) {
    return '/';
  }

  try {
    const decodedPath = decodeURIComponent(redirectPath);
    return decodedPath || '/';
  } catch (error) {
    console.error('Invalid redirect path:', error);
    return '/';
  }
} 