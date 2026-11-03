import { useState } from 'react'
import type { FormEvent } from 'react'
import BottomSheet from '../BottomSheet/BottomSheet'
import Button from '../Button/Button'
import TextInput from '../TextInput/TextInput'

type RenameSheetProps = {
  title: string
  value: string
  onSubmit: (value: string) => void
  onClose: () => void
}

function RenameSheet({ title, value, onSubmit, onClose }: RenameSheetProps) {
  const [name, setName] = useState(value)
  const trimmedName = name.trim()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!trimmedName) return
    onSubmit(trimmedName)
    onClose()
  }

  return (
    <BottomSheet title={title} onClose={onClose}>
      <form className="stack" onSubmit={handleSubmit}>
        <TextInput label="Название" value={name} onChange={setName} />
        <Button type="submit" disabled={!trimmedName}>
          Сохранить
        </Button>
      </form>
    </BottomSheet>
  )
}

export default RenameSheet
