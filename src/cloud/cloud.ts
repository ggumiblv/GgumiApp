import type { FirebaseOptions } from 'firebase/app'
import { firebaseConfig, useEmulator } from './firebaseConfig'

export type CloudUser = {
  uid: string
  email: string
}

export type CloudDocument = {
  data: string
  rev: string
}

// Firebase загружается только когда он нужен, основной код остаётся лёгким
async function loadServices(config: FirebaseOptions) {
  const [app, authSdk, firestoreSdk] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
    import('firebase/firestore/lite'),
  ])
  const firebaseApp = app.initializeApp(config)
  // Вход только по почте: скрипт Google для всплывающих окон не загружаем
  const auth = authSdk.initializeAuth(firebaseApp, {
    persistence: authSdk.indexedDBLocalPersistence,
  })
  const db = firestoreSdk.getFirestore(firebaseApp)
  if (useEmulator) {
    authSdk.connectAuthEmulator(auth, 'http://127.0.0.1:9099', {
      disableWarnings: true,
    })
    firestoreSdk.connectFirestoreEmulator(db, '127.0.0.1', 8080)
  }
  return { auth, authSdk, db, firestoreSdk }
}

const servicesPromise = firebaseConfig ? loadServices(firebaseConfig) : null

function services() {
  if (!servicesPromise) throw new Error('Cloud is not configured')
  return servicesPromise
}

export function subscribeToUser(onChange: (user: CloudUser | null) => void) {
  if (!servicesPromise) return () => {}
  let unsubscribe = () => {}
  void servicesPromise.then(({ auth, authSdk }) => {
    unsubscribe = authSdk.onAuthStateChanged(auth, (user) =>
      onChange(user ? { uid: user.uid, email: user.email ?? '' } : null),
    )
  })
  return () => unsubscribe()
}

// Сразу после запуска Firebase ещё не знает, кто вошёл, поэтому ждём проверку
export async function getSignedInUid() {
  if (!servicesPromise) return null
  const { auth } = await servicesPromise
  await auth.authStateReady()
  return auth.currentUser?.uid ?? null
}

export async function signIn(email: string, password: string) {
  const { auth, authSdk } = await services()
  await authSdk.signInWithEmailAndPassword(auth, email, password)
}

export async function signUp(email: string, password: string) {
  const { auth, authSdk } = await services()
  await authSdk.createUserWithEmailAndPassword(auth, email, password)
}

export async function resetPassword(email: string) {
  const { auth, authSdk } = await services()
  await authSdk.sendPasswordResetEmail(auth, email)
}

export async function signOutUser() {
  const { auth, authSdk } = await services()
  await authSdk.signOut(auth)
}

export async function fetchDocument(uid: string): Promise<CloudDocument | null> {
  const { db, firestoreSdk } = await services()
  const snapshot = await firestoreSdk.getDoc(firestoreSdk.doc(db, 'users', uid))
  return snapshot.exists() ? (snapshot.data() as CloudDocument) : null
}

export async function pushDocument(uid: string, document: CloudDocument) {
  const { db, firestoreSdk } = await services()
  await firestoreSdk.setDoc(firestoreSdk.doc(db, 'users', uid), document)
}

export async function deleteUserData(uid: string) {
  const { auth, authSdk, db, firestoreSdk } = await services()
  await firestoreSdk.deleteDoc(firestoreSdk.doc(db, 'users', uid))
  try {
    if (auth.currentUser) await authSdk.deleteUser(auth.currentUser)
  } catch {
    // Firebase просит недавний вход, данные уже удалены, поэтому просто выходим
    await authSdk.signOut(auth)
  }
}
