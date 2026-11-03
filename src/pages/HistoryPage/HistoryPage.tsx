import BackBar from '../../components/BackBar/BackBar'
import ListCard from '../../components/ListCard/ListCard'
import SectionTitle from '../../components/SectionTitle/SectionTitle'
import { formatFullDate, workoutStats } from '../../format'
import type { Workout } from '../../storage'

type HistoryPageProps = {
  workouts: Workout[]
  onOpen: (id: string) => void
  onBack: () => void
}

function HistoryPage({ workouts, onOpen, onBack }: HistoryPageProps) {
  return (
    <>
      <BackBar label="Главная" onBack={onBack} />
      <h1>История</h1>
      <SectionTitle title="Завершённые тренировки" count={workouts.length} />
      {workouts.length === 0 && (
        <p className="muted">
          Откройте день в плане и нажмите «Начать тренировку» — результат
          появится здесь.
        </p>
      )}
      {[...workouts].reverse().map((workout) => (
        <ListCard
          key={workout.id}
          eyebrow={formatFullDate(workout.date)}
          title={workout.dayName}
          subtitle={`${workout.planName} · ${workoutStats(workout)}`}
          onClick={() => onOpen(workout.id)}
        />
      ))}
    </>
  )
}

export default HistoryPage
