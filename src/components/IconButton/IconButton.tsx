import './IconButton.scss'

type IconButtonProps = {
  icon: string
  label: string
  round?: boolean
  onClick: () => void
}

function IconButton({ icon, label, round = false, onClick }: IconButtonProps) {
  return (
    <button
      type="button"
      className={`icon-button ${round ? 'icon-button--round' : ''}`}
      aria-label={label}
      onClick={onClick}
    >
      <img src={icon} alt="" />
    </button>
  )
}

export default IconButton
