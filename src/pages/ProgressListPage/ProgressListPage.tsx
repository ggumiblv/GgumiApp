import BackBar from '../../components/BackBar/BackBar'
import ListCard from '../../components/ListCard/ListCard'
import SectionTitle from '../../components/SectionTitle/SectionTitle'
import {
  bestResult,
  exerciseResults,
  formatFullDate,
  performedExerciseNames,
  plural,
  setsSummary,
} from '../../format'
import type { Workout } from '../../storage'

type ProgressListPageProps = {
  workouts: Workout[]
  onOpen: (exerciseName: string) => void
  onBack: () => void
}

function ProgressListPage({ workouts, onOpen, onBack }: ProgressListPageProps) {
  const names = performedExerciseNames(workouts)

  return (
    <>
      <BackBar label="Главная" onBack={onBack} />
      <h1>Прогресс</h1>
      <SectionTitle title="Упражнения" count={names.length} />

      {names.length === 0 && (
        <p className="muted">
          Завершите первую тренировку — упражнения и результаты появятся здесь.
        </p>
      )}

      {names.map((name) => {
        const results = exerciseResults(workouts, name)
        const best = bestResult(results)
        return (
          <ListCard
            key={name}
            eyebrow={`Последний раз: ${formatFullDate(results[0].date)}`}
            title={name}
            subtitle={`Лучший: ${best ? setsSummary([best.set]) : '—'} · ${plural(results.length, ['результат', 'результата', 'результатов'])}`}
            onClick={() => onOpen(name)}
          />
        )
      })}
    </>
  )
}

export default ProgressListPage
