import { useState } from 'react'
import BackBar from '../../components/BackBar/BackBar'
import Button from '../../components/Button/Button'
import ItemActions from '../../components/ItemActions/ItemActions'
import type { ActionsMode } from '../../components/ItemActions/ItemActions'
import ListCard from '../../components/ListCard/ListCard'
import MenuRow from '../../components/MenuRow/MenuRow'
import PageTitle from '../../components/PageTitle/PageTitle'
import SectionTitle from '../../components/SectionTitle/SectionTitle'
import { dayStats, planShortStats, planStats } from '../../format'
import { createDay } from '../../storage'
import type { Plan } from '../../storage'
import copyIcon from '../../assets/icons/copy.svg'
import plusIcon from '../../assets/icons/plus.svg'

type PlanPageProps = {
  plan: Plan
  onChange: (plan: Plan) => void
  onDuplicate: () => void
  onDelete: () => void
  onOpenDay: (id: string) => void
  onBack: () => void
}

function PlanPage({
  plan,
  onChange,
  onDuplicate,
  onDelete,
  onOpenDay,
  onBack,
}: PlanPageProps) {
  const [actions, setActions] = useState<ActionsMode>(null)

  return (
    <>
      <BackBar label="Планы" onBack={onBack} onMore={() => setActions('menu')} />
      <PageTitle
        eyebrow="Тренировочный план"
        title={plan.name}
        stats={planStats(plan)}
        onEdit={() => setActions('rename')}
      />
      <SectionTitle title="Дни" count={plan.days.length} />

      {plan.days.map((day, index) => (
        <ListCard
          key={day.id}
          number={index + 1}
          title={day.name}
          subtitle={dayStats(day)}
          onClick={() => onOpenDay(day.id)}
        />
      ))}
      <Button
        variant="dashed"
        icon={plusIcon}
        onClick={() =>
          onChange({
            ...plan,
            days: [...plan.days, createDay(plan.days.length + 1)],
          })
        }
      >
        Добавить день
      </Button>

      <ItemActions
        mode={actions}
        name={plan.name}
        subtitle={planShortStats(plan)}
        renameTitle="Название плана"
        deleteLabel="Удалить план"
        deleteText={`Будет удалено: ${planShortStats(plan)}. Отменить нельзя — если сомневаетесь, сначала сохраните копию.`}
        extraActions={
          <MenuRow
            icon={copyIcon}
            label="Дублировать план"
            hint="Создаст копию — удобно для новой версии"
            onClick={onDuplicate}
          />
        }
        onModeChange={setActions}
        onRename={(name) => onChange({ ...plan, name })}
        onDelete={onDelete}
      />
    </>
  )
}

export default PlanPage
