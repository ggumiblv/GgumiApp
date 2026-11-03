import type { ReactNode } from 'react'
import BottomSheet from '../BottomSheet/BottomSheet'
import Button from '../Button/Button'
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog'
import MenuRow from '../MenuRow/MenuRow'
import RenameSheet from '../RenameSheet/RenameSheet'
import pencilIcon from '../../assets/icons/pencil-white.svg'
import trashIcon from '../../assets/icons/trash-red.svg'

export type ActionsMode = 'menu' | 'rename' | 'delete' | null

type ItemActionsProps = {
  mode: ActionsMode
  name: string
  subtitle: string
  renameTitle: string
  deleteLabel: string
  deleteText: string
  extraActions?: ReactNode
  onModeChange: (mode: ActionsMode) => void
  onRename: (name: string) => void
  onDelete: () => void
}

// Меню элемента (план, день, упражнение): переименование и удаление с подтверждением
function ItemActions({
  mode,
  name,
  subtitle,
  renameTitle,
  deleteLabel,
  deleteText,
  extraActions,
  onModeChange,
  onRename,
  onDelete,
}: ItemActionsProps) {
  const close = () => onModeChange(null)

  if (mode === 'rename') {
    return (
      <RenameSheet
        title={renameTitle}
        value={name}
        onSubmit={onRename}
        onClose={close}
      />
    )
  }

  if (mode === 'delete') {
    return (
      <ConfirmDialog
        title={`Удалить «${name}»?`}
        text={deleteText}
        confirmLabel={deleteLabel}
        onConfirm={onDelete}
        onCancel={close}
      />
    )
  }

  if (mode === 'menu') {
    return (
      <BottomSheet title={name} subtitle={subtitle} withClose={false} onClose={close}>
        <div className="menu">
          <MenuRow
            icon={pencilIcon}
            label="Переименовать"
            onClick={() => onModeChange('rename')}
          />
          {extraActions}
          <MenuRow
            icon={trashIcon}
            label={deleteLabel}
            danger
            onClick={() => onModeChange('delete')}
          />
        </div>
        <Button variant="secondary" onClick={close}>
          Отмена
        </Button>
      </BottomSheet>
    )
  }

  return null
}

export default ItemActions
