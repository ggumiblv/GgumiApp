import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import Button from '../Button/Button'
import ImportInput from '../ImportInput/ImportInput'
import TextInput from '../TextInput/TextInput'
import type { AppData } from '../../storage'
import dumbbellIcon from '../../assets/icons/dumbbell.svg'
import plusIcon from '../../assets/icons/plus.svg'
import uploadIcon from '../../assets/icons/upload.svg'
import './WelcomeModal.scss'

type Source = 'new' | 'file'

type WelcomeModalProps = {
  onStart: (name: string) => void
  onImport: (data: AppData) => void
  onImportError: () => void
}

function WelcomeModal({ onStart, onImport, onImportError }: WelcomeModalProps) {
  const [name, setName] = useState('')
  const [source, setSource] = useState<Source>('new')
  const fileInput = useRef<HTMLInputElement>(null)
  const trimmedName = name.trim()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (source === 'file') fileInput.current?.click()
    else if (trimmedName) onStart(trimmedName)
  }

  const sources = [
    { id: 'new', icon: plusIcon, title: 'Начать с нуля', hint: 'Создадите планы сами' },
    { id: 'file', icon: uploadIcon, title: 'Восстановить из файла', hint: 'Резервная копия .json' },
  ] as const

  return (
    <div className="overlay overlay--center overlay--solid">
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
        <span className="round-icon">
          <img src={dumbbellIcon} alt="" />
        </span>
        <h2 id="welcome-title" className="title-large">Добро пожаловать</h2>
        <p className="muted">
          Приложение работает без интернета. Данные хранятся только на этом
          устройстве.
        </p>
        <form className="stack" onSubmit={handleSubmit}>
          <TextInput
            label="Как вас зовут?"
            placeholder="Имя"
            value={name}
            onChange={setName}
          />
          <span className="eyebrow">Откуда взять данные</span>
          {sources.map((item) => (
            <label
              key={item.id}
              className={`source ${source === item.id ? 'is-active' : ''}`}
            >
              <img src={item.icon} alt="" />
              <span className="source__text">
                <span>{item.title}</span>
                <span className="muted small">{item.hint}</span>
              </span>
              <input
                type="radio"
                name="source"
                checked={source === item.id}
                onChange={() => setSource(item.id)}
              />
            </label>
          ))}
          <Button type="submit" disabled={source === 'new' && !trimmedName}>
            Продолжить
          </Button>
        </form>
        <p className="muted small center">
          Имя и данные можно изменить в настройках
        </p>
        <ImportInput
          ref={fileInput}
          // В старых файлах может не быть имени, тогда берём введённое
          onImport={(data) => onImport({ ...data, name: data.name || trimmedName })}
          onError={onImportError}
        />
      </div>
    </div>
  )
}

export default WelcomeModal
