import { useRef, useState } from 'react'
import BackBar from '../../components/BackBar/BackBar'
import Button from '../../components/Button/Button'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import ImportInput from '../../components/ImportInput/ImportInput'
import MenuRow from '../../components/MenuRow/MenuRow'
import TextInput from '../../components/TextInput/TextInput'
import { formatDate } from '../../format'
import type { AppData } from '../../storage'
import calendarIcon from '../../assets/icons/calendar.svg'
import chevronIcon from '../../assets/icons/chevron-right.svg'
import downloadIcon from '../../assets/icons/download.svg'
import trashIcon from '../../assets/icons/trash-red.svg'
import uploadIcon from '../../assets/icons/upload.svg'
import './SettingsPage.scss'

type SettingsPageProps = {
  data: AppData
  onRename: (name: string) => void
  onExport: () => void
  onImport: (data: AppData) => void
  onImportError: () => void
  onDeleteAll: () => void
  onBack: () => void
}

function SettingsPage({
  data,
  onRename,
  onExport,
  onImport,
  onImportError,
  onDeleteAll,
  onBack,
}: SettingsPageProps) {
  const [name, setName] = useState(data.name)
  const [dialog, setDialog] = useState<'import' | 'delete' | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  function handleNameChange(value: string) {
    setName(value)
    // Пустое имя не сохраняем, иначе снова откроется приветственное окно
    if (value.trim()) onRename(value.trim())
  }

  return (
    <>
      <BackBar label="Главная" onBack={onBack} />
      <h1>Настройки</h1>

      <span className="eyebrow">Профиль</span>
      <TextInput
        label="Имя"
        value={name}
        onChange={handleNameChange}
        onBlur={() => setName(data.name)}
      />

      <span className="eyebrow">Данные</span>
      <div className="menu">
        <MenuRow
          icon={downloadIcon}
          label="Сохранить резервную копию"
          hint={
            data.lastBackupAt
              ? `Последняя: ${formatDate(data.lastBackupAt)}`
              : 'Ещё не сохраняли'
          }
          trailingIcon={chevronIcon}
          onClick={onExport}
        />
        <MenuRow
          icon={uploadIcon}
          label="Восстановить из файла"
          hint="Файл .json с этого или другого устройства"
          trailingIcon={chevronIcon}
          onClick={() => setDialog('import')}
        />
      </div>

      <div className="note">
        <img src={calendarIcon} alt="" />
        <p className="muted small">
          Данные хранятся только на этом устройстве. Сохраняйте копию раз в
          неделю — так ничего не потеряется.
        </p>
      </div>

      <Button variant="danger" icon={trashIcon} onClick={() => setDialog('delete')}>
        Удалить все данные
      </Button>

      <p className="muted small center">Версия 0.1 · работает без интернета</p>

      <ImportInput ref={fileInput} onImport={onImport} onError={onImportError} />

      {dialog === 'import' && (
        <ConfirmDialog
          title="Заменить данные?"
          text="Текущие данные заменятся данными из файла. Отменить нельзя."
          confirmLabel="Выбрать файл"
          danger={false}
          onConfirm={() => {
            setDialog(null)
            fileInput.current?.click()
          }}
          onCancel={() => setDialog(null)}
        />
      )}

      {dialog === 'delete' && (
        <ConfirmDialog
          title="Удалить все данные?"
          text="Имя и все планы будут удалены. Отменить нельзя — если сомневаетесь, сначала сохраните копию."
          confirmLabel="Удалить всё"
          onConfirm={onDeleteAll}
          onCancel={() => setDialog(null)}
        />
      )}
    </>
  )
}

export default SettingsPage
