import type { FirebaseOptions } from 'firebase/app'

// Эти значения не секрет: доступ к данным защищают правила из firestore.rules
const productionConfig: FirebaseOptions = {
  apiKey: 'AIzaSyAWOfE9X2Lt225NXfMJ23G7C9AFmDuIiBw',
  authDomain: 'ggumiapp.firebaseapp.com',
  projectId: 'ggumiapp',
  storageBucket: 'ggumiapp.firebasestorage.app',
  messagingSenderId: '780341821057',
  appId: '1:780341821057:web:64a7f480a3e54b7d311780',
}

export const useEmulator = Boolean(import.meta.env.VITE_USE_EMULATOR)

export const firebaseConfig: FirebaseOptions | null = useEmulator
  ? { apiKey: 'demo', projectId: 'demo-ggumiapp', appId: 'demo' }
  : productionConfig

export const isCloudConfigured = firebaseConfig !== null
