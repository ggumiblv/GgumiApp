import { useState } from 'react'
import BackBar from '../../components/BackBar/BackBar'
import Button from '../../components/Button/Button'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import PageTitle from '../../components/PageTitle/PageTitle'
import SetList from '../../components/SetList/SetList'
import { formatDate, lastResult, setsSummary, workoutStats } from '../../format'
import type { Workout } from '../../storage'
import './WorkoutPage.scss'

type WorkoutPageProps = {
  workout: Workout
  history: Workout[]
  onChange: (workout: Workout) => void
  onFinish: () => void
  onCancel: () => void
  onBack: () => void
}

function WorkoutPage({
  workout,
  history,
  onChange,
  onFinish,
  onCancel,
  onBack,
}: WorkoutPageProps) {
  const [isCancelOpen, setIsCancelOpen] = useState(false)

  return (
    <>
      <BackBar label="Главная" onBack={onBack} />
      <PageTitle
        eyebrow={`Тренировка · ${workout.planName}`}
        title={workout.dayName}
        stats={workoutStats(workout)}
      />
      <p className="muted small">
        Значения взяты из плана. Запишите, что получилось на самом деле: после
        завершения результат попадёт в историю и станет новыми значениями в плане.
      </p>

      {workout.exercises.map((exercise) => {
        const last = lastResult(history, exercise.name)
        return (
          <section className="workout-exercise" key={exercise.id}>
            <strong>{exercise.name}</strong>
            {last && (
              <p className="muted small">
                В прошлый раз ({formatDate(last.date)}): {setsSummary(last.sets)}
              </p>
            )}
            <SetList
              sets={exercise.sets}
              onChange={(sets) =>
                onChange({
                  ...workout,
                  exercises: workout.exercises.map((e) =>
                    e.id === exercise.id ? { ...e, sets } : e,
                  ),
                })
              }
            />
          </section>
        )
      })}

      <Button variant="ghost" onClick={() => setIsCancelOpen(true)}>
        Отменить тренировку
      </Button>
      <div className="page-footer">
        <Button onClick={onFinish}>Завершить тренировку</Button>
      </div>

      {isCancelOpen && (
        <ConfirmDialog
          title="Отменить тренировку?"
          text="Записанные результаты не сохранятся. План не изменится."
          confirmLabel="Отменить тренировку"
          onConfirm={onCancel}
          onCancel={() => setIsCancelOpen(false)}
        />
      )}
    </>
  )
}

export default WorkoutPage
