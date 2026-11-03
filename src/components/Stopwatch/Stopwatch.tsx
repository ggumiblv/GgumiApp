import { useEffect, useState } from 'react'
import { loadStopwatch, saveStopwatch } from '../../storage'
import type { StopwatchState } from '../../storage'
import pauseIcon from '../../assets/icons/pause-dark.svg'
import playIcon from '../../assets/icons/play-dark.svg'
import resetIcon from '../../assets/icons/reset.svg'
import './Stopwatch.scss'

const LIMIT = 15 * 60 * 1000
const STOPPED: StopwatchState = { startedAt: null, elapsed: 0 }

// Время считаем от момента старта: на заблокированном телефоне таймеры не работают
function getElapsed(state: StopwatchState, now: number) {
  if (state.startedAt === null) return state.elapsed
  return state.elapsed + Math.max(0, now - state.startedAt)
}

function formatTime(ms: number) {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

type StopwatchProps = {
  onLimit: () => void
}

function Stopwatch({ onLimit }: StopwatchProps) {
  const [state, setState] = useState(loadStopwatch)
  const [now, setNow] = useState(() => Date.now())
  const isRunning = state.startedAt !== null
  const elapsed = getElapsed(state, now)

  function update(next: StopwatchState) {
    setState(next)
    setNow(Date.now())
    saveStopwatch(next)
  }

  useEffect(() => {
    if (state.startedAt === null) return

    function tick() {
      const time = Date.now()
      if (getElapsed(state, time) >= LIMIT) {
        setState(STOPPED)
        saveStopwatch(STOPPED)
        onLimit()
      } else {
        setNow(time)
      }
    }

    const timer = setInterval(tick, 250)
    const firstTick = setTimeout(tick)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(timer)
      clearTimeout(firstTick)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [state, onLimit])

  return (
    <div className={`stopwatch ${isRunning ? 'is-running' : ''}`}>
      <div className="stopwatch__time">
        <span className="eyebrow">Секундомер</span>
        <span className="stopwatch__digits" role="timer">
          {formatTime(elapsed)}
        </span>
      </div>
      <div className="stopwatch__controls">
        <button
          type="button"
          className="stopwatch__button"
          aria-label="Сбросить секундомер"
          disabled={!isRunning && elapsed === 0}
          onClick={() => update(STOPPED)}
        >
          <img src={resetIcon} alt="" />
        </button>
        <button
          type="button"
          className="stopwatch__button stopwatch__button--main"
          aria-label={isRunning ? 'Пауза' : 'Запустить секундомер'}
          onClick={() =>
            update(
              isRunning
                ? { startedAt: null, elapsed }
                : { startedAt: Date.now(), elapsed },
            )
          }
        >
          <img src={isRunning ? pauseIcon : playIcon} alt="" />
        </button>
      </div>
    </div>
  )
}

export default Stopwatch
