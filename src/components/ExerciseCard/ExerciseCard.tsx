import { useState } from 'react'
import IconButton from '../IconButton/IconButton'
import ItemActions from '../ItemActions/ItemActions'
import type { ActionsMode } from '../ItemActions/ItemActions'
import SetList from '../SetList/SetList'
import { exerciseSummary, plural } from '../../format'
import type { Exercise } from '../../storage'
import chevronIcon from '../../assets/icons/chevron-down.svg'
import moreIcon from '../../assets/icons/more.svg'
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
          <SetList
            sets={exercise.sets}
            onChange={(sets) => onChange({ ...exercise, sets })}
          />
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
