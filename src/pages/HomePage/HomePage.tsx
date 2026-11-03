import { useState } from 'react'
import Button from '../../components/Button/Button'
import IconButton from '../../components/IconButton/IconButton'
import ListCard from '../../components/ListCard/ListCard'
import NewPlanSheet from '../../components/NewPlanSheet/NewPlanSheet'
import SectionTitle from '../../components/SectionTitle/SectionTitle'
import { formatUpdatedAt, greeting, planShortStats } from '../../format'
import type { AppData } from '../../storage'
import dumbbellIcon from '../../assets/icons/dumbbell.svg'
import plusIcon from '../../assets/icons/plus-dark.svg'
import settingsIcon from '../../assets/icons/settings.svg'
import './HomePage.scss'

type HomePageProps = {
  data: AppData
  onCreatePlan: (name: string, daysCount: number) => void
  onOpenPlan: (id: string) => void
  onOpenSettings: () => void
}

function HomePage({ data, onCreatePlan, onOpenPlan, onOpenSettings }: HomePageProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const hasPlans = data.plans.length > 0

  return (
    <>
      <header className="home-header">
        <div>
          <p className="muted">{greeting()}</p>
          <h1>{data.name}</h1>
        </div>
        <IconButton icon={settingsIcon} label="Настройки" round onClick={onOpenSettings} />
      </header>

      <SectionTitle title="Тренировочные планы" count={data.plans.length} />

      {hasPlans ? (
        <>
          <div className="plan-grid">
            {data.plans.map((plan) => (
              <ListCard
                key={plan.id}
                eyebrow={planShortStats(plan)}
                title={plan.name}
                subtitle={formatUpdatedAt(plan.updatedAt)}
                onClick={() => onOpenPlan(plan.id)}
              />
            ))}
          </div>
          <div className="page-footer">
            <Button icon={plusIcon} onClick={() => setIsSheetOpen(true)}>
              Новый план
            </Button>
          </div>
        </>
      ) : (
        <div className="empty">
          <span className="round-icon">
            <img src={dumbbellIcon} alt="" />
          </span>
          <strong>Пока нет планов</strong>
          <p className="muted">
            Создайте план: добавьте дни, упражнения, вес и количество повторов.
          </p>
          <Button icon={plusIcon} onClick={() => setIsSheetOpen(true)}>
            Добавить план
          </Button>
        </div>
      )}

      {isSheetOpen && (
        <NewPlanSheet
          onSubmit={(name, daysCount) => {
            setIsSheetOpen(false)
            onCreatePlan(name, daysCount)
          }}
          onClose={() => setIsSheetOpen(false)}
        />
      )}
    </>
  )
}

export default HomePage
