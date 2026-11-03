const DB_NAME = 'ggumiapp'
const STORE_NAME = 'documents'
const DATA_KEY = 'data'
const FILE_NAME = 'ggumiapp-data.json'

export type WorkoutSet = {
  id: string
  weight: string
  reps: string
}

export type Exercise = {
  id: string
  name: string
  sets: WorkoutSet[]
}

export type Day = {
  id: string
  name: string
  exercises: Exercise[]
}

export type Plan = {
  id: string
  name: string
  updatedAt: string
  days: Day[]
}

export type AppData = {
  version: number
  name: string
  lastBackupAt: string | null
  plans: Plan[]
}

export function createEmptyData(): AppData {
  return { version: 2, name: '', lastBackupAt: null, plans: [] }
}

export function createSet(weight = '', reps = ''): WorkoutSet {
  return { id: crypto.randomUUID(), weight, reps }
}

export function createDay(number: number): Day {
  return { id: crypto.randomUUID(), name: `День ${number}`, exercises: [] }
}

export function createPlan(name: string, daysCount: number): Plan {
  return {
    id: crypto.randomUUID(),
    name,
    updatedAt: new Date().toISOString(),
    days: Array.from({ length: daysCount }, (_, index) => createDay(index + 1)),
  }
}

export function touchPlan(plan: Plan): Plan {
  return { ...plan, updatedAt: new Date().toISOString() }
}

export function duplicatePlan(plan: Plan): Plan {
  return {
    ...plan,
    id: crypto.randomUUID(),
    name: `${plan.name} (копия)`,
    updatedAt: new Date().toISOString(),
    days: plan.days.map((day) => ({
      ...day,
      id: crypto.randomUUID(),
      exercises: day.exercises.map((exercise) => ({
        ...exercise,
        id: crypto.randomUUID(),
        sets: exercise.sets.map((set) => ({ ...set, id: crypto.randomUUID() })),
      })),
    })),
  }
}

function isList(value: unknown): value is Record<string, unknown>[] {
  return Array.isArray(value)
}

// Принимает и файлы старой версии без имени и планов, недостающие поля заполняются
function normalizeData(raw: unknown): AppData {
  const data = { ...createEmptyData(), ...(raw as Partial<AppData>), version: 2 }
  const isValid =
    typeof data.name === 'string' &&
    isList(data.plans) &&
    data.plans.every(
      (plan) =>
        isList(plan.days) &&
        plan.days.every(
          (day) =>
            isList(day.exercises) &&
            day.exercises.every((exercise) => isList(exercise.sets)),
        ),
    )
  if (!isValid) throw new Error('Unexpected data format')
  return data
}

// Одно соединение на всё приложение сохраняет порядок записей
let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  dbPromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  return dbPromise
}

export async function loadData(): Promise<AppData | null> {
  const db = await openDb()
  // Просим браузер не удалять данные при нехватке места, гарантий это не даёт
  void navigator.storage?.persist?.()
  return new Promise((resolve, reject) => {
    const request = db
      .transaction(STORE_NAME)
      .objectStore(STORE_NAME)
      .get(DATA_KEY)
    request.onsuccess = () => {
      try {
        resolve(request.result ? normalizeData(request.result) : null)
      } catch (error) {
        reject(error)
      }
    }
    request.onerror = () => reject(request.error)
  })
}

export async function saveData(data: AppData): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).put(data, DATA_KEY)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

// Возвращает false, если пользователь закрыл меню «Поделиться»
export async function exportToFile(data: AppData): Promise<boolean> {
  const file = new File([JSON.stringify(data, null, 2)], FILE_NAME, {
    type: 'application/json',
  })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
    } catch (error) {
      // Пользователь закрыл меню «Поделиться», это не ошибка
      if (error instanceof DOMException && error.name === 'AbortError') {
        return false
      }
      throw error
    }
    return true
  }

  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = FILE_NAME
  link.click()
  // Safari может не успеть начать скачивание, если отозвать ссылку сразу
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return true
}

export async function parseDataFile(file: File): Promise<AppData> {
  const parsed: unknown = JSON.parse(await file.text())
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Unexpected data format')
  }
  return normalizeData(parsed)
}
