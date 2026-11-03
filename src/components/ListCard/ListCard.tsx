import chevronIcon from '../../assets/icons/chevron-right.svg'
import './ListCard.scss'

type ListCardProps = {
  number?: number
  eyebrow?: string
  title: string
  subtitle: string
  onClick: () => void
}

function ListCard({ number, eyebrow, title, subtitle, onClick }: ListCardProps) {
  return (
    <button type="button" className="list-card" onClick={onClick}>
      {number !== undefined && <span className="list-card__number">{number}</span>}
      <span className="list-card__text">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <strong>{title}</strong>
        <span className="muted small">{subtitle}</span>
      </span>
      <img src={chevronIcon} alt="" />
    </button>
  )
}

export default ListCard
