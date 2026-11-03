import { useEffect, useState } from 'react'
import ConflictDialog from './components/ConflictDialog/ConflictDialog'
import WelcomeModal from './components/WelcomeModal/WelcomeModal'
import { useCloudSync } from './cloud/useCloudSync'
import DayPage from './pages/DayPage/DayPage'
import HistoryPage from './pages/HistoryPage/HistoryPage'
import HomePage from './pages/HomePage/HomePage'
import PlanPage from './pages/PlanPage/PlanPage'
import SettingsPage from './pages/SettingsPage/SettingsPage'
import WorkoutDetailPage from './pages/WorkoutDetailPage/WorkoutDetailPage'
import WorkoutPage from './pages/WorkoutPage/WorkoutPage'
import {
  createEmptyData,
  createPlan,
  createWorkout,
  duplicatePlan,
  exportToFile,
  loadData,
  saveData,
  touchPlan,
} from './storage'
import type { AppData, Day, Plan } from './storage'
import './App.scss'

type Status = 'loading' | 'ready' | 'failed'

type View =
  | { name: 'home' }
  | { name: 'settings' }
  | { name: 'history' }
  | { name: 'workout' }
  | { name: 'workoutDetail'; workoutId: string }
  | { name: 'plan'; planId: string }
  | { name: 'day'; planId: string; dayId: string }

const HOME: View = { name: 'home' }

function App() {
  const [status, setStatus] = useState<Status>('loading')
  const [data, setData] = useState<AppData>(createEmptyData)
  const [view, setView] = useState<View>(HOME)
  const [message, setMessage] = useState('')

  const cloud = useCloudSync(data, status === 'ready', applyCloudData)

  useEffect(() => {
    loadData()
      .then((stored) => {
        if (stored) setData(stored)
        setStatus('ready')
      })
      .catch(() => setStatus('failed'))
  }, [])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 3000)
    return () => clearTimeout(timer)
  }, [message])

  function saveLocally(next: AppData) {
    setData(next)
    saveData(next).catch(() => setMessage('Не удалось сохранить данные'))
  }

  function updateData(next: AppData) {
    saveLocally(next)
    cloud.markChanged(next)
  }

  function applyCloudData(next: AppData) {
    saveLocally(next)
    setView(HOME)
  }

  function updatePlan(next: Plan) {
    const plan = touchPlan(next)
    updateData({
      ...data,
      plans: data.plans.map((p) => (p.id === plan.id ? plan : p)),
    })
  }

  function deletePlan(id: string) {
    updateData({ ...data, plans: data.plans.filter((p) => p.id !== id) })
    setView(HOME)
  }

  function addPlan(plan: Plan) {
    updateData({ ...data, plans: [...data.plans, plan] })
    setView({ name: 'plan', planId: plan.id })
  }

  function handleImport(next: AppData) {
    updateData(next)
    setView(HOME)
    setMessage(next.name ? 'Данные восстановлены' : 'Введите имя, чтобы продолжить')
  }

  function handleExport() {
    exportToFile(data)
      .then((isSaved) => {
        if (isSaved) {
          updateData({ ...data, lastBackupAt: new Date().toISOString() })
        }
      })
      .catch(() => setMessage('Не удалось сохранить файл'))
  }

  function startWorkout(planName: string, day: Day) {
    // Незавершённая тренировка важнее новой, её легко потерять
    if (data.activeWorkout) {
      setMessage('Сначала завершите текущую тренировку')
    } else {
      updateData({ ...data, activeWorkout: createWorkout(planName, day) })
    }
    setView({ name: 'workout' })
  }

  async function handleDeleteAll() {
    try {
      await cloud.deleteCloudData()
    } catch {
      setMessage('Нужен интернет, чтобы удалить данные из аккаунта')
      return
    }
    saveLocally(createEmptyData())
    setView(HOME)
  }

  const handleImportError = () => setMessage('Не удалось прочитать файл')

  function renderPage() {
    if (view.name === 'settings') {
      return (
        <SettingsPage
          data={data}
          cloud={cloud}
          onRename={(name) => updateData({ ...data, name })}
          onExport={handleExport}
          onImport={handleImport}
          onImportError={handleImportError}
          onDeleteAll={() => void handleDeleteAll()}
          onBack={() => setView(HOME)}
        />
      )
    }

    if (view.name === 'workout' && data.activeWorkout) {
      const active = data.activeWorkout
      return (
        <WorkoutPage
          workout={active}
          history={data.workouts}
          onChange={(activeWorkout) => updateData({ ...data, activeWorkout })}
          onFinish={() => {
            updateData({
              ...data,
              activeWorkout: null,
              workouts: [...data.workouts, active],
            })
            setView({ name: 'workoutDetail', workoutId: active.id })
            setMessage('Тренировка сохранена')
          }}
          onCancel={() => {
            updateData({ ...data, activeWorkout: null })
            setView(HOME)
          }}
          onBack={() => setView(HOME)}
        />
      )
    }

    if (view.name === 'history') {
      return (
        <HistoryPage
          workouts={data.workouts}
          onOpen={(workoutId) => setView({ name: 'workoutDetail', workoutId })}
          onBack={() => setView(HOME)}
        />
      )
    }

    if (view.name === 'workoutDetail') {
      const workout = data.workouts.find((w) => w.id === view.workoutId)
      if (workout) {
        return (
          <WorkoutDetailPage
            workout={workout}
            onDelete={() => {
              updateData({
                ...data,
                workouts: data.workouts.filter((w) => w.id !== workout.id),
              })
              setView({ name: 'history' })
            }}
            onBack={() => setView({ name: 'history' })}
          />
        )
      }
    }

    const plan =
      (view.name === 'plan' || view.name === 'day') &&
      data.plans.find((p) => p.id === view.planId)

    if (plan && view.name === 'day') {
      const dayIndex = plan.days.findIndex((d) => d.id === view.dayId)
      const planView: View = { name: 'plan', planId: plan.id }
      const names = data.plans.flatMap((p) =>
        p.days.flatMap((d) => d.exercises.map((e) => e.name)),
      )
      return (
        <DayPage
          key={view.dayId}
          planName={plan.name}
          day={plan.days[dayIndex]}
          dayNumber={dayIndex + 1}
          daysCount={plan.days.length}
          suggestions={[...new Set(names)]}
          onStartWorkout={() => startWorkout(plan.name, plan.days[dayIndex])}
          onChange={(next) =>
            updatePlan({
              ...plan,
              days: plan.days.map((d) => (d.id === next.id ? next : d)),
            })
          }
          onDelete={() => {
            updatePlan({
              ...plan,
              days: plan.days.filter((d) => d.id !== view.dayId),
            })
            setView(planView)
          }}
          onBack={() => setView(planView)}
        />
      )
    }

    if (plan) {
      return (
        <PlanPage
          key={plan.id}
          plan={plan}
          onChange={updatePlan}
          onDuplicate={() => addPlan(duplicatePlan(plan))}
          onDelete={() => deletePlan(plan.id)}
          onOpenDay={(dayId) =>
            setView({ name: 'day', planId: plan.id, dayId })
          }
          onBack={() => setView(HOME)}
        />
      )
    }

    return (
      <HomePage
        data={data}
        onCreatePlan={(name, daysCount) => addPlan(createPlan(name, daysCount))}
        onOpenPlan={(planId) => setView({ name: 'plan', planId })}
        onOpenSettings={() => setView({ name: 'settings' })}
        onOpenHistory={() => setView({ name: 'history' })}
        onOpenWorkout={() => setView({ name: 'workout' })}
      />
    )
  }

  return (
    <main className="app">
      <div className="container">
        {status === 'failed' && <p>Не удалось открыть данные приложения</p>}
        {status === 'ready' && data.name && renderPage()}
        {status === 'ready' && !data.name && (
          <WelcomeModal
            onStart={(name) => updateData({ ...data, name })}
            onImport={handleImport}
            onImportError={handleImportError}
          />
        )}
      </div>
      {cloud.conflict && (
        <ConflictDialog
          cloudDate={cloud.conflict.rev}
          onKeepLocal={cloud.keepLocal}
          onUseCloud={cloud.useCloudVersion}
        />
      )}
      {message && (
        <p className="toast" role="status">
          {message}
        </p>
      )}
    </main>
  )
}

export default App
