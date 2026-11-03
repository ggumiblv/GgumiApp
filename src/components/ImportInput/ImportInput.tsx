import type { ChangeEvent, Ref } from 'react'
import { parseDataFile } from '../../storage'
import type { AppData } from '../../storage'

type ImportInputProps = {
  ref: Ref<HTMLInputElement>
  onImport: (data: AppData) => void
  onError: () => void
}

function ImportInput({ ref, onImport, onError }: ImportInputProps) {
  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Сброс позволяет выбрать тот же файл повторно
    event.target.value = ''
    if (!file) return
    try {
      onImport(await parseDataFile(file))
    } catch {
      onError()
    }
  }

  return (
    <input
      ref={ref}
      type="file"
      accept=".json,application/json"
      hidden
      onChange={handleChange}
    />
  )
}

export default ImportInput
