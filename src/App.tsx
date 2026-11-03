import { useEffect, useState } from 'react'
import ConflictDialog from './components/ConflictDialog/ConflictDialog'
import WelcomeModal from './components/WelcomeModal/WelcomeModal'
import { useCloudSync } from './cloud/useCloudSync'
import DayPage from './pages/DayPage/DayPage'
import ExerciseProgressPage from './pages/ExerciseProgressPage/ExerciseProgressPage'
import HistoryPage from './pages/HistoryPage/HistoryPage'
import HomePage from './pages/HomePage/HomePage'
import PlanPage from './pages/PlanPage/PlanPage'
import ProgressListPage from './pages/ProgressListPage/ProgressListPage'
import SettingsPage from './pages/SettingsPage/SettingsPage'
import WorkoutDetailPage from './pages/WorkoutDetailPage/WorkoutDetailPage'
import WorkoutPage from './pages/WorkoutPage/WorkoutPage'
import {
  applyWorkoutToPlans,
  createEmptyData,
  createPlan,
  createWorkout,
  duplicatePlan,
  exportToFile,
  loadData,
  saveData,
  saveStopwatch,
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
  | { name: 'progress' }
  | { name: 'exerciseProgress'; exerciseName: string; backView: View }
  | { name: 'plan'; planId: string }
  | { name: 'day'; planId: string; dayId: string }

const HOME: View = { name: 'home' }

type HistoryEntry = {
  view: View
  from: View | null
}

function App() {
  const [status, setStatus] = useState<Status>('loading')
  const [data, setData] = useState<AppData>(createEmptyData)
  const [view, setView] = useState<View>(HOME)
  const [message, setMessage] = useState('')

  const cloud = useCloudSync(data, status === 'ready', applyCloudData)

  // Экраны записаны в историю браузера, поэтому работает системная кнопка «Назад»
  useEffect(() => {
    window.history.replaceState({ view: HOME, from: null }, '')

    function handlePopState(event: PopStateEvent) {
      setView((event.state as HistoryEntry | null)?.view ?? HOME)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function goTo(next: View) {
    window.history.pushState({ view: next, from: view }, '')
    setView(next)
  }

  function replaceView(next: View) {
    const from = (window.history.state as HistoryEntry | null)?.from ?? null
    window.history.replaceState({ view: next, from }, '')
    setView(next)
  }

  // Кнопка в приложении: если родительский экран был предыдущим, просто шаг назад
  function goBackTo(target: View) {
    const from = (window.history.state as HistoryEntry | null)?.from
    if (JSON.stringify(from) === JSON.stringify(target)) {
      window.history.back()
    } else {
      replaceView(target)
    }
  }

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
    replaceView(HOME)
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
    goBackTo(HOME)
  }

  function addPlan(plan: Plan) {
    updateData({ ...data, plans: [...data.plans, plan] })
    goTo({ name: 'plan', planId: plan.id })
  }

  function handleImport(next: AppData) {
    updateData(next)
    replaceView(HOME)
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

  function startWorkout(plan: Plan, day: Day) {
    // Незавершённая тренировка важнее новой, её легко потерять
    if (data.activeWorkout) {
      setMessage('Сначала завершите текущую тренировку')
    } else {
      saveStopwatch({ startedAt: null, elapsed: 0 })
      updateData({ ...data, activeWorkout: createWorkout(plan, day) })
    }
    goTo({ name: 'workout' })
  }

  async function handleDeleteAll() {
    try {
      await cloud.deleteCloudData()
    } catch {
      setMessage('Нужен интернет, чтобы удалить данные из аккаунта')
      return
    }
    saveLocally(createEmptyData())
    replaceView(HOME)
  }

  const handleStopwatchLimit = () =>
    setMessage('Секундомер сброшен: прошёл час')

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
          onBack={() => goBackTo(HOME)}
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
              plans: applyWorkoutToPlans(data.plans, active),
            })
            replaceView({ name: 'workoutDetail', workoutId: active.id })
            setMessage('Тренировка сохранена')
          }}
          onCancel={() => {
            updateData({ ...data, activeWorkout: null })
            goBackTo(HOME)
          }}
          onStopwatchLimit={handleStopwatchLimit}
          onBack={() => goBackTo(HOME)}
        />
      )
    }

    if (view.name === 'progress') {
      return (
        <ProgressListPage
          workouts={data.workouts}
          onOpen={(exerciseName) =>
            goTo({ name: 'exerciseProgress', exerciseName, backView: view })
          }
          onBack={() => goBackTo(HOME)}
        />
      )
    }

    if (view.name === 'exerciseProgress') {
      const { backView, exerciseName } = view
      return (
        <ExerciseProgressPage
          exerciseName={exerciseName}
          workouts={data.workouts}
          onBack={() => goBackTo(backView)}
        />
      )
    }

    if (view.name === 'history') {
      return (
        <HistoryPage
          workouts={data.workouts}
          onOpen={(workoutId) => goTo({ name: 'workoutDetail', workoutId })}
          onBack={() => goBackTo(HOME)}
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
              goBackTo({ name: 'history' })
            }}
            onBack={() => goBackTo({ name: 'history' })}
          />
        )
      }
    }

    const plan =
      (view.name === 'plan' || view.name === 'day') &&
      data.plans.find((p) => p.id === view.planId)

    // В истории может остаться экран уже удалённого дня
    if (plan && view.name === 'day' && plan.days.some((d) => d.id === view.dayId)) {
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
          onStartWorkout={() => startWorkout(plan, plan.days[dayIndex])}
          onOpenProgress={(exerciseName) =>
            goTo({ name: 'exerciseProgress', exerciseName, backView: view })
          }
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
            goBackTo(planView)
          }}
          onBack={() => goBackTo(planView)}
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
            goTo({ name: 'day', planId: plan.id, dayId })
          }
          onBack={() => goBackTo(HOME)}
        />
      )
    }

    return (
      <HomePage
        data={data}
        onCreatePlan={(name, daysCount) => addPlan(createPlan(name, daysCount))}
        onOpenPlan={(planId) => goTo({ name: 'plan', planId })}
        onOpenSettings={() => goTo({ name: 'settings' })}
        onOpenHistory={() => goTo({ name: 'history' })}
        onOpenProgress={() => goTo({ name: 'progress' })}
        onOpenWorkout={() => goTo({ name: 'workout' })}
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
