import IconButton from '../IconButton/IconButton'
import pencilIcon from '../../assets/icons/pencil.svg'
import './PageTitle.scss'

type PageTitleProps = {
  eyebrow: string
  title: string
  stats: string
  onEdit: () => void
}

function PageTitle({ eyebrow, title, stats, onEdit }: PageTitleProps) {
  return (
    <header className="page-title">
      <span className="eyebrow">{eyebrow}</span>
      <div className="page-title__row">
        <h1>{title}</h1>
        <IconButton icon={pencilIcon} label="Переименовать" onClick={onEdit} />
      </div>
      <p className="muted small">{stats}</p>
    </header>
  )
}

export default PageTitle
