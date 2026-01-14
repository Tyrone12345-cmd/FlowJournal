/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // weitere env Variablen hier hinzufügen
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
