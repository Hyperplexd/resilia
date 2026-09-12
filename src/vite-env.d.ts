/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional. If set, CityMap uses MapTiler's styles instead of the OpenFreeMap default. */
  readonly VITE_MAPTILER_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
