import BackBar from '../../components/BackBar/BackBar'
import PageTitle from '../../components/PageTitle/PageTitle'
import SectionTitle from '../../components/SectionTitle/SectionTitle'
import { bestResult, exerciseResults, formatFullDate, setsSummary } from '../../format'
import type { Workout } from '../../storage'
import './ExerciseProgressPage.scss'

type ExerciseProgressPageProps = {
  exerciseName: string
  workouts: Workout[]
  onBack: () => void
}

function ExerciseProgressPage({
  exerciseName,
  workouts,
  onBack,
}: ExerciseProgressPageProps) {
  const results = exerciseResults(workouts, exerciseName)
  const best = bestResult(results)

  return (
    <>
      <BackBar label="Назад" onBack={onBack} />
      <PageTitle
        eyebrow="Прогресс"
        title={exerciseName}
        stats={best ? `Лучший результат: ${setsSummary([best.set])}` : 'Пока нет результатов'}
      />
      <SectionTitle title="Результаты" count={results.length} />

      {results.length === 0 && (
        <p className="muted">
          Завершите тренировку с этим упражнением — результат появится здесь.
        </p>
      )}

      {results.map((result) => (
        <section className="progress-result" key={result.id}>
          <span className="eyebrow">{formatFullDate(result.date)}</span>
          <p>{setsSummary(result.sets)}</p>
        </section>
      ))}
    </>
  )
}

export default ExerciseProgressPage
