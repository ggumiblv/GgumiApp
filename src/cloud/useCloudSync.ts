import { useCallback, useEffect, useRef, useState } from 'react'
import {
  deleteUserData,
  fetchDocument,
  getSignedInUid,
  pushDocument,
  signOutUser,
  subscribeToUser,
} from './cloud'
import type { CloudUser } from './cloud'
import { isCloudConfigured } from './firebaseConfig'
import { loadSyncMeta, normalizeData, saveSyncMeta } from '../storage'
import type { AppData, SyncMeta } from '../storage'

const PUSH_DELAY = 3000

export type SyncStatus = 'idle' | 'saving' | 'offline' | 'error'

type Conflict = {
  data: AppData
  rev: string
}

export type CloudSync = {
  user: CloudUser | null
  status: SyncStatus
  conflict: Conflict | null
  markChanged: (next: AppData) => void
  keepLocal: () => void
  useCloudVersion: () => void
  signOut: () => Promise<void>
  deleteCloudData: () => Promise<void>
}

function hasContent(data: AppData) {
  return (
    data.plans.length > 0 ||
    data.workouts.length > 0 ||
    data.activeWorkout !== null
  )
}

// Приложение работает с локальными данными, а облако хранит их копию.
// rev показывает, какую версию из облака это устройство видело последней.
export function useCloudSync(
  data: AppData,
  isReady: boolean,
  onCloudData: (data: AppData) => void,
): CloudSync {
  const [user, setUser] = useState<CloudUser | null>(null)
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [conflict, setConflict] = useState<Conflict | null>(null)

  const latest = useRef({ data, user, onCloudData })
  const meta = useRef<SyncMeta | null>(null)
  const isSyncing = useRef(false)
  const isSyncQueued = useRef(false)
  // Изменения могут появиться раньше, чем Firebase сообщит, кто вошёл
  const hasEarlyChange = useRef(false)
  const pushTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    latest.current = { data, user, onCloudData }
  })

  const setMeta = useCallback((next: SyncMeta | null) => {
    meta.current = next
    void saveSyncMeta(next)
  }, [])

  const push = useCallback(
    async (uid: string) => {
      const sent = latest.current.data
      const rev = new Date().toISOString()
      await pushDocument(uid, { data: JSON.stringify(sent), rev })
      // Пока шла отправка, данные могли измениться, тогда копия ещё не актуальна
      setMeta({ uid, rev, isDirty: latest.current.data !== sent })
    },
    [setMeta],
  )

  const syncOnce = useCallback(
    async (uid: string) => {
      const known =
        meta.current?.uid === uid
          ? meta.current
          : { uid, rev: null, isDirty: hasContent(latest.current.data) }
      meta.current = known

      const cloud = await fetchDocument(uid)
      const local = latest.current.data
      if (!cloud) {
        // Без имени загружать нечего: человек ещё не прошёл приветственное окно
        if (local.name) await push(uid)
      } else if (cloud.rev === known.rev) {
        if (known.isDirty) await push(uid)
      } else {
        const cloudData = normalizeData(JSON.parse(cloud.data))
        if (known.isDirty && hasContent(local)) {
          setConflict({ data: cloudData, rev: cloud.rev })
        } else {
          setMeta({ uid, rev: cloud.rev, isDirty: false })
          latest.current.onCloudData(cloudData)
        }
      }
    },
    [push, setMeta],
  )

  const sync = useCallback(async () => {
    const uid = latest.current.user?.uid
    if (!uid) return
    if (isSyncing.current) {
      isSyncQueued.current = true
      return
    }
    if (!navigator.onLine) {
      setStatus('offline')
      return
    }

    isSyncing.current = true
    setStatus('saving')
    try {
      do {
        isSyncQueued.current = false
        await syncOnce(uid)
      } while (isSyncQueued.current)
      setStatus('idle')
    } catch {
      setStatus('error')
    } finally {
      isSyncing.current = false
    }
  }, [syncOnce])

  useEffect(() => {
    if (!isCloudConfigured || !isReady) return
    let unsubscribe = () => {}
    void loadSyncMeta().then((stored) => {
      meta.current = stored
      unsubscribe = subscribeToUser((next) => {
        latest.current.user = next
        setUser(next)
        if (!next) return
        if (hasEarlyChange.current) {
          hasEarlyChange.current = false
          const rev = meta.current?.uid === next.uid ? meta.current.rev : null
          setMeta({ uid: next.uid, rev, isDirty: true })
        }
        void sync()
      })
    })
    return () => unsubscribe()
  }, [isReady, setMeta, sync])

  useEffect(() => {
    if (!user) return

    function handleVisibility() {
      // iOS может закрыть приложение сразу после сворачивания, поэтому не ждём таймер
      void sync()
    }

    function handleOnline() {
      void sync()
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('online', handleOnline)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('online', handleOnline)
    }
  }, [user, sync])

  const markChanged = useCallback(
    (next: AppData) => {
      latest.current.data = next
      const uid = latest.current.user?.uid
      if (!uid) {
        hasEarlyChange.current = true
        return
      }
      if (!meta.current?.isDirty) {
        setMeta({ uid, rev: meta.current?.rev ?? null, isDirty: true })
      }
      clearTimeout(pushTimer.current)
      pushTimer.current = setTimeout(() => void sync(), PUSH_DELAY)
    },
    [setMeta, sync],
  )

  const keepLocal = useCallback(() => {
    const uid = latest.current.user?.uid
    if (!uid || !conflict) return
    setMeta({ uid, rev: conflict.rev, isDirty: true })
    setConflict(null)
    void sync()
  }, [conflict, setMeta, sync])

  const useCloudVersion = useCallback(() => {
    const uid = latest.current.user?.uid
    if (!uid || !conflict) return
    setMeta({ uid, rev: conflict.rev, isDirty: false })
    setConflict(null)
    latest.current.onCloudData(conflict.data)
  }, [conflict, setMeta])

  const signOut = useCallback(async () => {
    clearTimeout(pushTimer.current)
    await signOutUser()
    setMeta(null)
    setConflict(null)
  }, [setMeta])

  const deleteCloudData = useCallback(async () => {
    const uid = await getSignedInUid()
    if (!uid) return
    if (!navigator.onLine) throw new Error('Offline')
    clearTimeout(pushTimer.current)
    await deleteUserData(uid)
    setMeta(null)
  }, [setMeta])

  return {
    user,
    status,
    conflict,
    markChanged,
    keepLocal,
    useCloudVersion,
    signOut,
    deleteCloudData,
  }
}
