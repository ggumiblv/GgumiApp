import type { Day, Exercise, Plan } from './storage'

const pluralRules = new Intl.PluralRules('ru')

// forms: одна, несколько, много — «1 день», «2 дня», «5 дней»
export function plural(count: number, forms: [string, string, string]) {
  const rule = pluralRules.select(count)
  const form = rule === 'one' ? forms[0] : rule === 'few' ? forms[1] : forms[2]
  return `${count} ${form}`
}

const days = (count: number) => plural(count, ['день', 'дня', 'дней'])
const exercises = (count: number) =>
  plural(count, ['упражнение', 'упражнения', 'упражнений'])
const sets = (count: number) => plural(count, ['подход', 'подхода', 'подходов'])

function countSets(list: Exercise[]) {
  return list.reduce((sum, exercise) => sum + exercise.sets.length, 0)
}

export function dayStats(day: Day) {
  return `${exercises(day.exercises.length)} · ${sets(countSets(day.exercises))}`
}

export function planShortStats(plan: Plan) {
  const all = plan.days.flatMap((day) => day.exercises)
  return `${days(plan.days.length)} · ${exercises(all.length)}`
}

export function planStats(plan: Plan) {
  const all = plan.days.flatMap((day) => day.exercises)
  return `${planShortStats(plan)} · ${sets(countSets(all))}`
}

export function exerciseSummary(exercise: Exercise) {
  const first = exercise.sets[0]
  if (!first) return 'Нет подходов'
  const weight = first.weight ? `${first.weight} кг` : 'свой вес'
  return `${sets(exercise.sets.length)} · ${weight} × ${first.reps || '—'}`
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru', {
    day: 'numeric',
    month: 'long',
  })
}

export function formatUpdatedAt(iso: string) {
  const isToday = new Date(iso).toDateString() === new Date().toDateString()
  return `Изменён ${isToday ? 'сегодня' : formatDate(iso)}`
}

export function greeting() {
  const hour = new Date().getHours()
  if (hour < 6) return 'Доброй ночи,'
  if (hour < 12) return 'Доброе утро,'
  if (hour < 18) return 'Добрый день,'
  return 'Добрый вечер,'
}
