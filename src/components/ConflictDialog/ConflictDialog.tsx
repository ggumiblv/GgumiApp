import Button from '../Button/Button'
import { formatDate } from '../../format'

type ConflictDialogProps = {
  cloudDate: string
  onKeepLocal: () => void
  onUseCloud: () => void
}

function ConflictDialog({ cloudDate, onKeepLocal, onUseCloud }: ConflictDialogProps) {
  return (
    <div className="overlay overlay--center">
      <div className="dialog" role="alertdialog" aria-modal="true" aria-label="Данные различаются">
        <h2>Данные различаются</h2>
        <p className="muted">
          Данные на этом устройстве отличаются от копии в аккаунте от{' '}
          {formatDate(cloudDate)}. Выберите, какие оставить, вторые будут заменены.
        </p>
        <Button onClick={onKeepLocal}>Оставить с этого устройства</Button>
        <Button variant="secondary" onClick={onUseCloud}>
          Взять из аккаунта
        </Button>
      </div>
    </div>
  )
}

export default ConflictDialog
