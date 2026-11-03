import IconButton from '../IconButton/IconButton'
import backIcon from '../../assets/icons/chevron-left.svg'
import moreIcon from '../../assets/icons/more.svg'
import './BackBar.scss'

type BackBarProps = {
  label: string
  onBack: () => void
  onMore?: () => void
}

function BackBar({ label, onBack, onMore }: BackBarProps) {
  return (
    <div className="back-bar">
      <button type="button" className="back-bar__link" onClick={onBack}>
        <img src={backIcon} alt="" />
        <span>{label}</span>
      </button>
      {onMore && (
        <IconButton icon={moreIcon} label="Действия" round onClick={onMore} />
      )}
    </div>
  )
}

export default BackBar
