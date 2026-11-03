import './UnitInput.scss'

type UnitInputProps = {
  label: string
  unit: string
  value: string
  inputMode: 'decimal' | 'numeric'
  onChange: (value: string) => void
}

function UnitInput({ label, unit, value, inputMode, onChange }: UnitInputProps) {
  return (
    <label className="unit-input">
      <input
        aria-label={label}
        type="text"
        inputMode={inputMode}
        placeholder="0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <span>{unit}</span>
    </label>
  )
}

export default UnitInput
