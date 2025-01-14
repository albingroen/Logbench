/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WORKER_URL: string
  readonly APPLE_API_KEY: string
  readonly APPLE_API_KEY_ID: string
  readonly APPLE_API_ISSUER: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
