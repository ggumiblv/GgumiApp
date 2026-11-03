import { useState } from 'react'
import BackBar from '../../components/BackBar/BackBar'
import Button from '../../components/Button/Button'
import ExerciseCard from '../../components/ExerciseCard/ExerciseCard'
import ItemActions from '../../components/ItemActions/ItemActions'
import type { ActionsMode } from '../../components/ItemActions/ItemActions'
import NewExerciseSheet from '../../components/NewExerciseSheet/NewExerciseSheet'
import PageTitle from '../../components/PageTitle/PageTitle'
import SectionTitle from '../../components/SectionTitle/SectionTitle'
import { dayStats } from '../../format'
import type { Day, Exercise } from '../../storage'
import plusIcon from '../../assets/icons/plus.svg'

type DayPageProps = {
  planName: string
  day: Day
  dayNumber: number
  daysCount: number
  suggestions: string[]
  onChange: (day: Day) => void
  onDelete: () => void
  onBack: () => void
}

function DayPage({
  planName,
  day,
  dayNumber,
  daysCount,
  suggestions,
  onChange,
  onDelete,
  onBack,
}: DayPageProps) {
  const [actions, setActions] = useState<ActionsMode>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [openExerciseId, setOpenExerciseId] = useState<string | null>(
    day.exercises[0]?.id ?? null,
  )

  function changeExercises(exercises: Exercise[]) {
    onChange({ ...day, exercises })
  }

  return (
    <>
      <BackBar label={planName} onBack={onBack} onMore={() => setActions('menu')} />
      <PageTitle
        eyebrow={`День ${dayNumber} из ${daysCount}`}
        title={day.name}
        stats={dayStats(day)}
        onEdit={() => setActions('rename')}
      />
      <SectionTitle title="Упражнения" count={day.exercises.length} />

      {day.exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          isOpen={exercise.id === openExerciseId}
          onToggle={() =>
            setOpenExerciseId(exercise.id === openExerciseId ? null : exercise.id)
          }
          onChange={(next) =>
            changeExercises(
              day.exercises.map((e) => (e.id === next.id ? next : e)),
            )
          }
          onDelete={() =>
            changeExercises(day.exercises.filter((e) => e.id !== exercise.id))
          }
        />
      ))}
      <Button variant="dashed" icon={plusIcon} onClick={() => setIsSheetOpen(true)}>
        Добавить упражнение
      </Button>

      {isSheetOpen && (
        <NewExerciseSheet
          suggestions={suggestions}
          onSubmit={(exercise) => {
            changeExercises([...day.exercises, exercise])
            setOpenExerciseId(exercise.id)
            setIsSheetOpen(false)
          }}
          onClose={() => setIsSheetOpen(false)}
        />
      )}

      <ItemActions
        mode={actions}
        name={day.name}
        subtitle={dayStats(day)}
        renameTitle="Название дня"
        deleteLabel="Удалить день"
        deleteText={`Будет удалено: ${dayStats(day)}. Отменить нельзя.`}
        onModeChange={setActions}
        onRename={(name) => onChange({ ...day, name })}
        onDelete={onDelete}
      />
    </>
  )
}

export default DayPage
