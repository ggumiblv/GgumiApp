const DB_NAME = 'ggumiapp'
const STORE_NAME = 'documents'
const DATA_KEY = 'data'
const SYNC_KEY = 'sync'
const STOPWATCH_KEY = 'ggumiapp-stopwatch'
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

export type Workout = {
  id: string
  date: string
  planId?: string
  dayId?: string
  planName: string
  dayName: string
  exercises: Exercise[]
}

export type AppData = {
  version: number
  name: string
  lastBackupAt: string | null
  plans: Plan[]
  workouts: Workout[]
  activeWorkout: Workout | null
}

export type StopwatchState = {
  startedAt: number | null
  elapsed: number
}

export type SyncMeta = {
  uid: string
  rev: string | null
  isDirty: boolean
}

export function createEmptyData(): AppData {
  return {
    version: 3,
    name: '',
    lastBackupAt: null,
    plans: [],
    workouts: [],
    activeWorkout: null,
  }
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

export function createWorkout(plan: Plan, day: Day): Workout {
  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    planId: plan.id,
    dayId: day.id,
    planName: plan.name,
    dayName: day.name,
    // id упражнения не меняем: по нему результат вернётся в план
    exercises: day.exercises.map((exercise) => ({
      ...exercise,
      sets: copySets(exercise.sets),
    })),
  }
}

// Последний результат становится новыми значениями в плане.
// Упражнение без подходов считаем пропущенным и оставляем как было.
export function applyWorkoutToPlans(plans: Plan[], workout: Workout): Plan[] {
  return plans.map((plan) => {
    if (plan.id !== workout.planId) return plan
    return touchPlan({
      ...plan,
      days: plan.days.map((day) => {
        if (day.id !== workout.dayId) return day
        return {
          ...day,
          exercises: day.exercises.map((exercise) => {
            const done = workout.exercises.find((e) => e.id === exercise.id)
            if (!done || done.sets.length === 0) return exercise
            return { ...exercise, sets: copySets(done.sets) }
          }),
        }
      }),
    })
  })
}

export function touchPlan(plan: Plan): Plan {
  return { ...plan, updatedAt: new Date().toISOString() }
}

function copySets(sets: WorkoutSet[]): WorkoutSet[] {
  return sets.map((set) => ({ ...set, id: crypto.randomUUID() }))
}

function copyExercises(exercises: Exercise[]): Exercise[] {
  return exercises.map((exercise) => ({
    ...exercise,
    id: crypto.randomUUID(),
    sets: copySets(exercise.sets),
  }))
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
      exercises: copyExercises(day.exercises),
    })),
  }
}

function isList(value: unknown): value is Record<string, unknown>[] {
  return Array.isArray(value)
}

function hasValidExercises(item: Record<string, unknown>) {
  return (
    isList(item.exercises) &&
    item.exercises.every((exercise) => isList(exercise.sets))
  )
}

// Принимает и файлы старых версий, недостающие поля заполняются
export function normalizeData(raw: unknown): AppData {
  const data = { ...createEmptyData(), ...(raw as Partial<AppData>), version: 3 }
  const isValid =
    typeof data.name === 'string' &&
    isList(data.plans) &&
    data.plans.every(
      (plan) => isList(plan.days) && plan.days.every(hasValidExercises),
    ) &&
    isList(data.workouts) &&
    data.workouts.every(hasValidExercises) &&
    (data.activeWorkout === null || hasValidExercises(data.activeWorkout))
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

async function readValue(key: string): Promise<unknown> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME).objectStore(STORE_NAME).get(key)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function loadData(): Promise<AppData | null> {
  // Просим браузер не удалять данные при нехватке места, гарантий это не даёт
  void navigator.storage?.persist?.()
  const stored = await readValue(DATA_KEY)
  return stored ? normalizeData(stored) : null
}

// Секундомер относится к этому устройству, поэтому он лежит отдельно от данных
export function loadStopwatch(): StopwatchState {
  try {
    const stored = localStorage.getItem(STOPWATCH_KEY)
    if (stored) return JSON.parse(stored) as StopwatchState
  } catch {
    // Без сохранённого значения секундомер просто начнёт с нуля
  }
  return { startedAt: null, elapsed: 0 }
}

export function saveStopwatch(state: StopwatchState) {
  try {
    localStorage.setItem(STOPWATCH_KEY, JSON.stringify(state))
  } catch {
    // Секундомер продолжит работать, пока приложение открыто
  }
}

export async function loadSyncMeta(): Promise<SyncMeta | null> {
  return ((await readValue(SYNC_KEY)) as SyncMeta | undefined) ?? null
}

export function saveData(data: AppData): Promise<void> {
  return writeValue(DATA_KEY, data)
}

export function saveSyncMeta(meta: SyncMeta | null): Promise<void> {
  return writeValue(SYNC_KEY, meta)
}

async function writeValue(key: string, value: unknown): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).put(value, key)
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
