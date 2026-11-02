import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  createEmptyData,
  exportToFile,
  loadData,
  parseDataFile,
  saveData,
} from './storage'
import type { AppData } from './storage'

type Status = 'loading' | 'empty' | 'ready' | 'failed'

function App() {
  const [status, setStatus] = useState<Status>('loading')
  const [data, setData] = useState<AppData | null>(null)
  const [message, setMessage] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadData()
      .then((stored) => {
        setData(stored)
        setStatus(stored ? 'ready' : 'empty')
      })
      .catch(() => setStatus('failed'))
  }, [])

  async function applyData(next: AppData) {
    await saveData(next)
    setData(next)
    setStatus('ready')
  }

  async function handleCreate() {
    try {
      await applyData(createEmptyData())
      setMessage('')
    } catch {
      setMessage('Не удалось сохранить данные')
    }
  }

  async function handleExport() {
    if (!data) return
    try {
      await exportToFile(data)
      setMessage('')
    } catch {
      setMessage('Не удалось сохранить файл')
    }
  }

  function handleImportClick() {
    if (data && !window.confirm('Заменить текущие данные данными из файла?')) {
      return
    }
    fileInput.current?.click()
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Сброс позволяет выбрать тот же файл повторно
    event.target.value = ''
    if (!file) return
    try {
      await applyData(await parseDataFile(file))
      setMessage('Данные восстановлены')
    } catch {
      setMessage('Не удалось прочитать файл')
    }
  }

  if (status === 'loading') return null

  return (
    <main className="app">
      <h1>GgumiApp</h1>

      {status === 'failed' && <p>Не удалось открыть хранилище данных</p>}

      {status === 'empty' && (
        <>
          <p>Данных пока нет</p>
          <div className="actions">
            <button type="button" onClick={handleCreate}>
              Начать с нуля
            </button>
            <button type="button" onClick={handleImportClick}>
              Восстановить из файла
            </button>
          </div>
        </>
      )}

      {status === 'ready' && (
        <>
          <p>Здесь будут твои тренировки</p>
          <div className="actions">
            <button type="button" onClick={handleExport}>
              Сохранить в файл
            </button>
            <button type="button" onClick={handleImportClick}>
              Восстановить из файла
            </button>
          </div>
        </>
      )}

      {message && <p role="status">{message}</p>}

      <input
        ref={fileInput}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={handleFileChange}
      />
    </main>
  )
}

export default App
