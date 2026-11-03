import type { ReactNode } from 'react'
import IconButton from '../IconButton/IconButton'
import closeIcon from '../../assets/icons/close.svg'
import './BottomSheet.scss'

type BottomSheetProps = {
  title: string
  subtitle?: string
  withClose?: boolean
  onClose: () => void
  children: ReactNode
}

function BottomSheet({
  title,
  subtitle,
  withClose = true,
  onClose,
  children,
}: BottomSheetProps) {
  return (
    <div className="overlay overlay--sheet" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet__handle" />
        <div className="sheet__header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p className="muted small">{subtitle}</p>}
          </div>
          {withClose && (
            <IconButton icon={closeIcon} label="Закрыть" round onClick={onClose} />
          )}
        </div>
        {children}
      </div>
    </div>
  )
}

export default BottomSheet
