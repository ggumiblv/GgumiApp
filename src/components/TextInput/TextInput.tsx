import './TextInput.scss'

type TextInputProps = {
  label: string
  value: string
  placeholder?: string
  type?: 'text' | 'email' | 'password'
  autoComplete?: string
  onChange: (value: string) => void
  onBlur?: () => void
}

function TextInput({
  label,
  onChange,
  type = 'text',
  autoComplete = 'off',
  ...props
}: TextInputProps) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input
        className="text-input"
        type={type}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
    </label>
  )
}

export default TextInput
