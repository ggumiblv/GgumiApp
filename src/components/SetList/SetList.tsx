import Button from '../Button/Button'
import SetRow from '../SetRow/SetRow'
import { createSet } from '../../storage'
import type { WorkoutSet } from '../../storage'
import plusIcon from '../../assets/icons/plus.svg'
import './SetList.scss'

type SetListProps = {
  sets: WorkoutSet[]
  onChange: (sets: WorkoutSet[]) => void
}

function SetList({ sets, onChange }: SetListProps) {
  function addSet() {
    // Новый подход удобнее начинать со значений предыдущего
    const last = sets.at(-1)
    onChange([...sets, createSet(last?.weight, last?.reps)])
  }

  return (
    <>
      {sets.length > 0 && (
        <div className="set-labels eyebrow">
          <span>Вес, кг</span>
          <span>Повторы</span>
        </div>
      )}
      {sets.map((set, index) => (
        <SetRow
          key={set.id}
          number={index + 1}
          set={set}
          onChange={(next) =>
            onChange(sets.map((s) => (s.id === set.id ? next : s)))
          }
          onDelete={() => onChange(sets.filter((s) => s.id !== set.id))}
        />
      ))}
      <Button variant="ghost" icon={plusIcon} onClick={addSet}>
        Добавить подход
      </Button>
    </>
  )
}

export default SetList
