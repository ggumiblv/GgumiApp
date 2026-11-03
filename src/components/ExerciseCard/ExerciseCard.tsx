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
  const openClass = isOpen ? 'is-open' : ''

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
            <span className={`exercise__summary ${isOpen ? '' : 'is-open'}`}>
              <span className="muted small">{exerciseSummary(exercise)}</span>
            </span>
          </span>
          <img className={isOpen ? 'is-flipped' : ''} src={chevronIcon} alt="" />
        </button>
        <div className={`exercise__more ${openClass}`} inert={!isOpen}>
          <div>
            <IconButton
              icon={moreIcon}
              label="Действия с упражнением"
              onClick={() => setActions('menu')}
            />
          </div>
        </div>
      </div>

      <div className={`exercise__body ${openClass}`} inert={!isOpen}>
        <div>
          <div className="exercise__sets">
            <SetList
              sets={exercise.sets}
              onChange={(sets) => onChange({ ...exercise, sets })}
            />
          </div>
        </div>
      </div>

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
