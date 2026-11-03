import { useState } from 'react'
import type { FormEvent } from 'react'
import BottomSheet from '../BottomSheet/BottomSheet'
import Button from '../Button/Button'
import TextInput from '../TextInput/TextInput'
import { resetPassword, signIn, signUp } from '../../cloud/cloud'

const ERRORS: Record<string, string> = {
  'auth/invalid-credential': 'Неверная почта или пароль',
  'auth/user-not-found': 'Неверная почта или пароль',
  'auth/wrong-password': 'Неверная почта или пароль',
  'auth/invalid-email': 'Проверьте адрес почты',
  'auth/email-already-in-use': 'Такой аккаунт уже есть, попробуйте войти',
  'auth/weak-password': 'Пароль должен быть не короче 6 символов',
  'auth/missing-password': 'Введите пароль',
  'auth/missing-email': 'Введите почту',
  'auth/network-request-failed': 'Нет соединения с интернетом',
  'auth/too-many-requests': 'Слишком много попыток, попробуйте позже',
}

type AccountSheetProps = {
  onClose: () => void
}

function AccountSheet({ onClose }: AccountSheetProps) {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isBusy, setIsBusy] = useState(false)

  function showError(error: unknown) {
    const code = (error as { code?: string }).code ?? ''
    setMessage(ERRORS[code] ?? 'Не получилось, попробуйте ещё раз')
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIsBusy(true)
    setMessage('')
    try {
      await (mode === 'signIn' ? signIn : signUp)(email.trim(), password)
      onClose()
    } catch (error) {
      showError(error)
    } finally {
      setIsBusy(false)
    }
  }

  async function handleReset() {
    try {
      await resetPassword(email.trim())
      setMessage('Письмо для смены пароля отправлено')
    } catch (error) {
      showError(error)
    }
  }

  const isSignIn = mode === 'signIn'

  return (
    <BottomSheet title={isSignIn ? 'Вход в аккаунт' : 'Новый аккаунт'} onClose={onClose}>
      <form className="stack" onSubmit={handleSubmit}>
        <TextInput
          label="Почта"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
        />
        <TextInput
          label="Пароль"
          type="password"
          autoComplete={isSignIn ? 'current-password' : 'new-password'}
          value={password}
          onChange={setPassword}
        />
        {message && <p role="alert">{message}</p>}
        <Button type="submit" disabled={isBusy}>
          {isSignIn ? 'Войти' : 'Создать аккаунт'}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setMode(isSignIn ? 'signUp' : 'signIn')
            setMessage('')
          }}
        >
          {isSignIn ? 'Создать аккаунт' : 'У меня уже есть аккаунт'}
        </Button>
        {isSignIn && (
          <Button variant="ghost" onClick={() => void handleReset()}>
            Забыли пароль?
          </Button>
        )}
        {!isSignIn && (
          <p className="muted small">
            Копия данных будет храниться в сервисе Google Firebase. Владелец
            приложения технически может её увидеть.
          </p>
        )}
      </form>
    </BottomSheet>
  )
}

export default AccountSheet
