import type { SimulationFrame } from '../../simulation/simulationTypes'
import type { PlaybackSpeed } from '../../hooks/useSimulation'
import './Timeline.css'

type TimelineProps = {
  frames: SimulationFrame[]
  index: number
  isPlaying: boolean
  speed: PlaybackSpeed
  onPlay: () => void
  onPause: () => void
  onPrev: () => void
  onStep: () => void
  onReset: () => void
  onGoTo: (index: number) => void
  onSpeedChange: (speed: PlaybackSpeed) => void
}

const SPEEDS: PlaybackSpeed[] = [1, 2, 5, 10]

export default function Timeline({
  frames,
  index,
  isPlaying,
  speed,
  onPlay,
  onPause,
  onPrev,
  onStep,
  onReset,
  onGoTo,
  onSpeedChange,
}: TimelineProps) {
  return (
    <div className="timeline">
      <div className="timeline__controls">
        <button className="timeline__btn" onClick={onReset} title="Reset">
          ⟲
        </button>
        <button className="timeline__btn" onClick={onPrev} title="Previous step">
          |◀
        </button>
        <button className="timeline__btn timeline__btn--primary" onClick={isPlaying ? onPause : onPlay}>
          {isPlaying ? '❚❚ Pause' : '▶ Play'}
        </button>
        <button className="timeline__btn" onClick={onStep} title="Next step">
          ▶|
        </button>

        <div className="timeline__speeds">
          {SPEEDS.map((s) => (
            <button
              key={s}
              className={`timeline__speed${s === speed ? ' timeline__speed--active' : ''}`}
              onClick={() => onSpeedChange(s)}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <div className="timeline__track">
        {frames.map((f, i) => (
          <button
            key={f.time}
            className={`timeline__mark${i === index ? ' timeline__mark--active' : ''}${i < index ? ' timeline__mark--past' : ''}`}
            onClick={() => onGoTo(i)}
          >
            <span className="timeline__mark-dot" />
            <span className="timeline__mark-label">T+{String(f.time).padStart(2, '0')}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
