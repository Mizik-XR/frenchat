
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_API_URL?: string;
  readonly VITE_ENVIRONMENT?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_LOVABLE_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: {
    readonly data: any;
    dispose(cb: (data: any) => void): void;
    accept(cb?: (cb: () => void) => void): void;
  };
  readonly url: string;
}
