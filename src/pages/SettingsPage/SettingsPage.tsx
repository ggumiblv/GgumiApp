import { useRef, useState } from 'react'
import BackBar from '../../components/BackBar/BackBar'
import Button from '../../components/Button/Button'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import ImportInput from '../../components/ImportInput/ImportInput'
import MenuRow from '../../components/MenuRow/MenuRow'
import TextInput from '../../components/TextInput/TextInput'
import { formatDate } from '../../format'
import AccountSheet from '../../components/AccountSheet/AccountSheet'
import { isCloudConfigured } from '../../cloud/firebaseConfig'
import type { CloudSync } from '../../cloud/useCloudSync'
import type { AppData } from '../../storage'
import accountIcon from '../../assets/icons/account.svg'
import calendarIcon from '../../assets/icons/calendar.svg'
import chevronIcon from '../../assets/icons/chevron-right.svg'
import downloadIcon from '../../assets/icons/download.svg'
import trashIcon from '../../assets/icons/trash-red.svg'
import uploadIcon from '../../assets/icons/upload.svg'
import './SettingsPage.scss'

const SYNC_LABELS: Record<CloudSync['status'], string> = {
  idle: 'Копия сохранена',
  saving: 'Сохраняем копию…',
  offline: 'Нет интернета, копия сохранится позже',
  error: 'Не удалось сохранить копию',
}

type SettingsPageProps = {
  data: AppData
  cloud: CloudSync
  onRename: (name: string) => void
  onExport: () => void
  onImport: (data: AppData) => void
  onImportError: () => void
  onDeleteAll: () => void
  onBack: () => void
}

function SettingsPage({
  data,
  cloud,
  onRename,
  onExport,
  onImport,
  onImportError,
  onDeleteAll,
  onBack,
}: SettingsPageProps) {
  const [name, setName] = useState(data.name)
  const [dialog, setDialog] = useState<'import' | 'delete' | 'signOut' | null>(null)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
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

      {isCloudConfigured && (
        <>
          <span className="eyebrow">Аккаунт</span>
          <div className="menu">
            {cloud.user ? (
              <MenuRow
                icon={accountIcon}
                label={cloud.user.email}
                hint={`${SYNC_LABELS[cloud.status]} · нажмите, чтобы выйти`}
                onClick={() => setDialog('signOut')}
              />
            ) : (
              <MenuRow
                icon={accountIcon}
                label="Войти или создать аккаунт"
                hint="Данные сохранятся, даже если удалить приложение"
                trailingIcon={chevronIcon}
                onClick={() => setIsAccountOpen(true)}
              />
            )}
          </div>
        </>
      )}

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
          {cloud.user
            ? 'Данные сохраняются на устройстве и автоматически копируются в ваш аккаунт, когда есть интернет.'
            : isCloudConfigured
              ? 'Данные сохраняются на устройстве. Войдите в аккаунт или сохраняйте копию раз в неделю — так ничего не потеряется.'
              : 'Данные сохраняются на устройстве. Сохраняйте копию раз в неделю — так ничего не потеряется.'}
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

      {dialog === 'signOut' && (
        <ConfirmDialog
          title="Выйти из аккаунта?"
          text="Данные останутся на этом устройстве, но перестанут копироваться в облако."
          confirmLabel="Выйти"
          danger={false}
          onConfirm={() => {
            setDialog(null)
            void cloud.signOut()
          }}
          onCancel={() => setDialog(null)}
        />
      )}

      {isAccountOpen && <AccountSheet onClose={() => setIsAccountOpen(false)} />}

      {dialog === 'delete' && (
        <ConfirmDialog
          title="Удалить все данные?"
          text={
            cloud.user
              ? 'Имя, планы и история будут удалены с устройства и из вашего аккаунта. Отменить нельзя — если сомневаетесь, сначала сохраните копию.'
              : 'Имя, планы и история будут удалены. Отменить нельзя — если сомневаетесь, сначала сохраните копию.'
          }
          confirmLabel="Удалить всё"
          onConfirm={onDeleteAll}
          onCancel={() => setDialog(null)}
        />
      )}
    </>
  )
}

export default SettingsPage
