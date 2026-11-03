import type { FirebaseOptions } from 'firebase/app'

// Эти значения не секрет: доступ к данным защищают правила из firestore.rules
const productionConfig: FirebaseOptions | null = null

export const useEmulator = Boolean(import.meta.env.VITE_USE_EMULATOR)

export const firebaseConfig: FirebaseOptions | null = useEmulator
  ? { apiKey: 'demo', projectId: 'demo-ggumiapp', appId: 'demo' }
  : productionConfig

export const isCloudConfigured = firebaseConfig !== null
