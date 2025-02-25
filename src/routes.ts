
import { RouteConfig } from '@/types/routes'

export const routes: RouteConfig[] = [
  {
    path: '/auth',
    isPrivate: false,
  },
  {
    path: '/auth/callback/google',
    isPrivate: false,
  },
  {
    path: '/chat',
    isPrivate: true,
  },
  {
    path: '/config',
    isPrivate: true,
  },
  {
    path: '/config/microsoft-teams',
    isPrivate: true,
  },
  {
    path: '/config/cloud-ai',
    isPrivate: true,
  },
  {
    path: '/config/local-ai',
    isPrivate: true,
  },
  {
    path: '/documents',
    isPrivate: true,
  },
  {
    path: '/advanced-config',
    isPrivate: true,
  },
  {
    path: '/',
    redirectTo: '/chat',
    isPrivate: false,
  }
];
