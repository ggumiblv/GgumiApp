import './TextInput.scss'

type TextInputProps = {
  label: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
  onBlur?: () => void
}

function TextInput({ label, onChange, ...props }: TextInputProps) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input
        className="text-input"
        type="text"
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
    </label>
  )
}

export default TextInput
