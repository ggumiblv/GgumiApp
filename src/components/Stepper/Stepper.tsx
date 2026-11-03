import minusIcon from '../../assets/icons/minus.svg'
import plusIcon from '../../assets/icons/plus.svg'
import IconButton from '../IconButton/IconButton'
import './Stepper.scss'

type StepperProps = {
  label: string
  value: number
  unit?: string
  step?: number
  min: number
  onChange: (value: number) => void
}

function Stepper({ label, value, unit, step = 1, min, onChange }: StepperProps) {
  return (
    <div className="stepper">
      <span>{label}</span>
      <div className="stepper__controls">
        <IconButton
          icon={minusIcon}
          label={`${label}: меньше`}
          onClick={() => onChange(Math.max(min, value - step))}
        />
        <output className="stepper__value">
          {value}
          {unit && <small> {unit}</small>}
        </output>
        <IconButton
          icon={plusIcon}
          label={`${label}: больше`}
          onClick={() => onChange(value + step)}
        />
      </div>
    </div>
  )
}

export default Stepper
