import type { CSSProperties } from 'react'
import type { SimulationFrame } from '../../simulation/simulationTypes'
import type { PlaybackSpeed } from '../../hooks/useSimulation'
import './Timeline.css'

type TimelineProps = {
  frames: SimulationFrame[]
  /** Fractional node index. The playhead glides between integer T-nodes. */
  progress: number
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
  progress,
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

      <div
        className="timeline__track"
        style={{ '--node-count': frames.length } as CSSProperties}
      >
        <div className="timeline__rail" aria-hidden="true">
          <div
            className="timeline__rail-fill"
            style={{ width: `${(progress / Math.max(1, frames.length - 1)) * 100}%` }}
          />
          <div
            className="timeline__playhead"
            style={{ left: `${(progress / Math.max(1, frames.length - 1)) * 100}%` }}
          />
        </div>
        <div className="timeline__nodes">
          {frames.map((f, i) => {
            const reached = i <= progress + 0.001
            const nearest = Math.round(progress) === i
            return (
              <button
                key={f.time}
                className={`timeline__mark${reached ? ' timeline__mark--past' : ''}${nearest ? ' timeline__mark--near' : ''}`}
                onClick={() => onGoTo(i)}
              >
                <span className="timeline__mark-dot" />
                <span className="timeline__mark-label">T+{String(f.time).padStart(2, '0')}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
