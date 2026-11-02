const DB_NAME = 'ggumiapp'
const STORE_NAME = 'documents'
const DATA_KEY = 'data'
const FILE_NAME = 'ggumiapp-data.json'

// Структура данных будет расширяться, version нужен для будущих миграций
export type AppData = {
  version: number
}

export function createEmptyData(): AppData {
  return { version: 1 }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function loadData(): Promise<AppData | null> {
  const db = await openDb()
  try {
    return await new Promise((resolve, reject) => {
      const request = db
        .transaction(STORE_NAME)
        .objectStore(STORE_NAME)
        .get(DATA_KEY)
      request.onsuccess = () => resolve((request.result as AppData) ?? null)
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

export async function saveData(data: AppData): Promise<void> {
  const db = await openDb()
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      transaction.objectStore(STORE_NAME).put(data, DATA_KEY)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
  } finally {
    db.close()
  }
  // Просим браузер не удалять данные при нехватке места, гарантий это не даёт
  await navigator.storage?.persist?.()
}

export async function exportToFile(data: AppData): Promise<void> {
  const file = new File([JSON.stringify(data, null, 2)], FILE_NAME, {
    type: 'application/json',
  })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
    } catch (error) {
      // Пользователь закрыл меню «Поделиться», это не ошибка
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        throw error
      }
    }
    return
  }

  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = FILE_NAME
  link.click()
  // Safari может не успеть начать скачивание, если отозвать ссылку сразу
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function parseDataFile(file: File): Promise<AppData> {
  const parsed: unknown = JSON.parse(await file.text())
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    typeof (parsed as AppData).version !== 'number'
  ) {
    throw new Error('Unexpected data file format')
  }
  return parsed as AppData
}
