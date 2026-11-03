import './MenuRow.scss'

type MenuRowProps = {
  icon: string
  label: string
  hint?: string
  trailingIcon?: string
  danger?: boolean
  onClick: () => void
}

function MenuRow({ icon, label, hint, trailingIcon, danger, onClick }: MenuRowProps) {
  return (
    <button
      type="button"
      className={`menu-row ${danger ? 'menu-row--danger' : ''}`}
      onClick={onClick}
    >
      <img src={icon} alt="" />
      <span className="menu-row__text">
        <span>{label}</span>
        {hint && <span className="muted small">{hint}</span>}
      </span>
      {trailingIcon && <img src={trailingIcon} alt="" />}
    </button>
  )
}

export default MenuRow
