import { useState } from 'react'
import type { FormEvent } from 'react'
import BottomSheet from '../BottomSheet/BottomSheet'
import Button from '../Button/Button'
import Stepper from '../Stepper/Stepper'
import TextInput from '../TextInput/TextInput'
import { plural } from '../../format'
import { createSet } from '../../storage'
import type { Exercise } from '../../storage'
import './NewExerciseSheet.scss'

type NewExerciseSheetProps = {
  suggestions: string[]
  onSubmit: (exercise: Exercise) => void
  onClose: () => void
}

function NewExerciseSheet({ suggestions, onSubmit, onClose }: NewExerciseSheetProps) {
  const [name, setName] = useState('')
  const [setsCount, setSetsCount] = useState(3)
  const [weight, setWeight] = useState(20)
  const [reps, setReps] = useState(10)
  const trimmedName = name.trim()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!trimmedName) return
    onSubmit({
      id: crypto.randomUUID(),
      name: trimmedName,
      sets: Array.from({ length: setsCount }, () =>
        createSet(weight ? String(weight) : '', String(reps)),
      ),
    })
  }

  return (
    <BottomSheet title="Новое упражнение" onClose={onClose}>
      <form className="stack" onSubmit={handleSubmit}>
        <TextInput
          label="Название"
          placeholder="Например, Жим гантелей сидя"
          value={name}
          onChange={setName}
        />
        {suggestions.length > 0 && (
          <div className="field">
            <span className="field__label">Из ваших планов</span>
            <div className="chips">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="chip"
                  onClick={() => setName(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="field">
          <span className="field__label">Начальные подходы</span>
          <div className="stepper-group">
            <Stepper label="Подходы" value={setsCount} min={1} onChange={setSetsCount} />
            <Stepper label="Вес" unit="кг" value={weight} step={2.5} min={0} onChange={setWeight} />
            <Stepper label="Повторы" unit="раз" value={reps} min={1} onChange={setReps} />
          </div>
        </div>
        <p className="muted small">
          Создадим {plural(setsCount, ['одинаковый подход', 'одинаковых подхода', 'одинаковых подходов'])}{' '}
          — вес и повторы каждого можно поменять после.
        </p>
        <Button type="submit" disabled={!trimmedName}>
          Добавить упражнение
        </Button>
      </form>
    </BottomSheet>
  )
}

export default NewExerciseSheet
