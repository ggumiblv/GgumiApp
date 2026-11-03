import { useState } from 'react'
import type { FormEvent } from 'react'
import BottomSheet from '../BottomSheet/BottomSheet'
import Button from '../Button/Button'
import TextInput from '../TextInput/TextInput'
import './NewPlanSheet.scss'

const DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7]

type NewPlanSheetProps = {
  onSubmit: (name: string, daysCount: number) => void
  onClose: () => void
}

function NewPlanSheet({ onSubmit, onClose }: NewPlanSheetProps) {
  const [name, setName] = useState('')
  const [daysCount, setDaysCount] = useState(3)
  const trimmedName = name.trim()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (trimmedName) onSubmit(trimmedName, daysCount)
  }

  return (
    <BottomSheet title="Новый план" onClose={onClose}>
      <form className="stack" onSubmit={handleSubmit}>
        <TextInput
          label="Название плана"
          placeholder="Например, Сила — фулбоди"
          value={name}
          onChange={setName}
        />
        <div className="field">
          <span className="field__label">Сколько дней создать сразу</span>
          <div className="segmented">
            {DAY_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={option === daysCount ? 'is-active' : ''}
                aria-pressed={option === daysCount}
                onClick={() => setDaysCount(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <p className="muted small">
          Создадим «День 1»…«День {daysCount}». Названия, количество дней и
          упражнения можно менять в любой момент.
        </p>
        <Button type="submit" disabled={!trimmedName}>
          Создать план
        </Button>
      </form>
    </BottomSheet>
  )
}

export default NewPlanSheet
