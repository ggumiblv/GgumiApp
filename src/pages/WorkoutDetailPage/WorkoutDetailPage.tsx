import { useState } from 'react'
import BackBar from '../../components/BackBar/BackBar'
import Button from '../../components/Button/Button'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import PageTitle from '../../components/PageTitle/PageTitle'
import { formatFullDate, setsSummary, workoutStats } from '../../format'
import type { Workout } from '../../storage'
import trashIcon from '../../assets/icons/trash-red.svg'
import './WorkoutDetailPage.scss'

type WorkoutDetailPageProps = {
  workout: Workout
  onDelete: () => void
  onBack: () => void
}

function WorkoutDetailPage({ workout, onDelete, onBack }: WorkoutDetailPageProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  return (
    <>
      <BackBar label="История" onBack={onBack} />
      <PageTitle
        eyebrow={formatFullDate(workout.date)}
        title={workout.dayName}
        stats={`${workout.planName} · ${workoutStats(workout)}`}
      />

      {workout.exercises.map((exercise) => (
        <section className="workout-result" key={exercise.id}>
          <strong>{exercise.name}</strong>
          <p className="muted small">
            {exercise.sets.length > 0 ? setsSummary(exercise.sets) : 'Нет подходов'}
          </p>
        </section>
      ))}

      <Button variant="danger" icon={trashIcon} onClick={() => setIsDeleteOpen(true)}>
        Удалить из истории
      </Button>

      {isDeleteOpen && (
        <ConfirmDialog
          title="Удалить тренировку?"
          text="Она исчезнет из истории. Отменить нельзя."
          confirmLabel="Удалить"
          onConfirm={onDelete}
          onCancel={() => setIsDeleteOpen(false)}
        />
      )}
    </>
  )
}

export default WorkoutDetailPage
