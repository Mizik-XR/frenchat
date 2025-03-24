import type { NavigateFunction, Location } from 'react-router-dom';

export function handleRedirection(navigate: NavigateFunction, location: Location): void {
  const params = new URLSearchParams(location.search);
  const redirectPath = params.get('redirect');

  if (!redirectPath) {
    navigate('/');
    return;
  }

  try {
    const decodedPath = decodeURIComponent(redirectPath);
    navigate(decodedPath);
  } catch (error) {
    console.error('Invalid redirect path:', error);
    navigate('/');
  }
} 