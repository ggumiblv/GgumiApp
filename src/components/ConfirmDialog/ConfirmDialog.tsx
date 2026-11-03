import Button from '../Button/Button'
import trashIcon from '../../assets/icons/trash-red.svg'

type ConfirmDialogProps = {
  title: string
  text: string
  confirmLabel: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialog({
  title,
  text,
  confirmLabel,
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="overlay overlay--center" onClick={onCancel}>
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <h2>{title}</h2>
        <p className="muted">{text}</p>
        <Button
          variant={danger ? 'danger' : 'primary'}
          icon={danger ? trashIcon : undefined}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </div>
  )
}

export default ConfirmDialog
