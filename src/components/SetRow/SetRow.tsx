import IconButton from '../IconButton/IconButton'
import UnitInput from '../UnitInput/UnitInput'
import trashIcon from '../../assets/icons/trash.svg'
import type { WorkoutSet } from '../../storage'
import './SetRow.scss'

type SetRowProps = {
  number: number
  set: WorkoutSet
  onChange: (set: WorkoutSet) => void
  onDelete: () => void
}

function SetRow({ number, set, onChange, onDelete }: SetRowProps) {
  return (
    <div className="set-row">
      <span className="set-row__number">{number}</span>
      <UnitInput
        label={`Вес, подход ${number}`}
        unit="кг"
        inputMode="decimal"
        value={set.weight}
        onChange={(weight) =>
          onChange({ ...set, weight: weight.replace(/[^\d.,]/g, '') })
        }
      />
      <span className="muted">×</span>
      <UnitInput
        label={`Повторы, подход ${number}`}
        unit="раз"
        inputMode="numeric"
        value={set.reps}
        onChange={(reps) => onChange({ ...set, reps: reps.replace(/\D/g, '') })}
      />
      <IconButton icon={trashIcon} label={`Удалить подход ${number}`} onClick={onDelete} />
    </div>
  )
}

export default SetRow
