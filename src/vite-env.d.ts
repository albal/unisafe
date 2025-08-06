/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REDDIT_CLIENT_ID: string
  readonly VITE_REDDIT_CLIENT_SECRET: string
  readonly VITE_OPENAI_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
