import { useState } from 'react'
import Button from '../Button/Button'
import IconButton from '../IconButton/IconButton'
import ItemActions from '../ItemActions/ItemActions'
import type { ActionsMode } from '../ItemActions/ItemActions'
import SetRow from '../SetRow/SetRow'
import { exerciseSummary, plural } from '../../format'
import { createSet } from '../../storage'
import type { Exercise, WorkoutSet } from '../../storage'
import chevronIcon from '../../assets/icons/chevron-down.svg'
import moreIcon from '../../assets/icons/more.svg'
import plusIcon from '../../assets/icons/plus.svg'
import './ExerciseCard.scss'

type ExerciseCardProps = {
  exercise: Exercise
  isOpen: boolean
  onToggle: () => void
  onChange: (exercise: Exercise) => void
  onDelete: () => void
}

function ExerciseCard({
  exercise,
  isOpen,
  onToggle,
  onChange,
  onDelete,
}: ExerciseCardProps) {
  const [actions, setActions] = useState<ActionsMode>(null)

  function changeSets(sets: WorkoutSet[]) {
    onChange({ ...exercise, sets })
  }

  function addSet() {
    // Новый подход удобнее начинать со значений предыдущего
    const last = exercise.sets.at(-1)
    changeSets([...exercise.sets, createSet(last?.weight, last?.reps)])
  }

  return (
    <section className="exercise">
      <div className="exercise__header">
        <button
          type="button"
          className="exercise__toggle"
          aria-expanded={isOpen}
          onClick={onToggle}
        >
          <span>
            <strong>{exercise.name}</strong>
            {!isOpen && (
              <span className="muted small">{exerciseSummary(exercise)}</span>
            )}
          </span>
          <img className={isOpen ? 'is-flipped' : ''} src={chevronIcon} alt="" />
        </button>
        {isOpen && (
          <IconButton
            icon={moreIcon}
            label="Действия с упражнением"
            onClick={() => setActions('menu')}
          />
        )}
      </div>

      {isOpen && (
        <div className="exercise__body">
          {exercise.sets.length > 0 && (
            <div className="set-labels eyebrow">
              <span>Вес, кг</span>
              <span>Повторы</span>
            </div>
          )}
          {exercise.sets.map((set, index) => (
            <SetRow
              key={set.id}
              number={index + 1}
              set={set}
              onChange={(next) =>
                changeSets(exercise.sets.map((s) => (s.id === set.id ? next : s)))
              }
              onDelete={() =>
                changeSets(exercise.sets.filter((s) => s.id !== set.id))
              }
            />
          ))}
          <Button variant="ghost" icon={plusIcon} onClick={addSet}>
            Добавить подход
          </Button>
        </div>
      )}

      <ItemActions
        mode={actions}
        name={exercise.name}
        subtitle={plural(exercise.sets.length, ['подход', 'подхода', 'подходов'])}
        renameTitle="Название упражнения"
        deleteLabel="Удалить упражнение"
        deleteText="Упражнение и его подходы будут удалены. Отменить нельзя."
        onModeChange={setActions}
        onRename={(name) => onChange({ ...exercise, name })}
        onDelete={onDelete}
      />
    </section>
  )
}

export default ExerciseCard
