import { useEffect, useMemo, useRef, useState } from 'react'
import { runSimulation } from '../simulation/simulationEngine'
import { frameAt } from '../simulation/interpolateFrame'
import { DEFAULT_SCENARIO, TIME_POINTS } from '../simulation/scenarios'
import type { LngLat, ScenarioInput } from '../simulation/simulationTypes'

export type PlaybackSpeed = 1 | 2 | 5 | 10

const BASE_FRAME_INTERVAL_MS = 5800

export function useSimulation(ignition: LngLat) {
  const [scenario, setScenarioState] = useState<ScenarioInput>(DEFAULT_SCENARIO)
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<PlaybackSpeed>(1)
  const progressRef = useRef(0)

  const frames = useMemo(() => runSimulation(ignition, scenario, TIME_POINTS), [ignition, scenario])
  const currentFrame = useMemo(() => frameAt(frames, progress), [frames, progress])

  const seek = (next: number) => {
    const clamped = Math.max(0, Math.min(next, frames.length - 1))
    progressRef.current = clamped
    setProgress(clamped)
  }

  // Changing the scenario invalidates the current run — restart at T+00
  // rather than showing a stale index against newly computed frames.
  const setScenario = (next: ScenarioInput) => {
    progressRef.current = 0
    setProgress(0)
    setScenarioState(next)
    setIsPlaying(false)
  }

  useEffect(() => {
    if (!isPlaying) return
    let raf = 0
    let last = performance.now()

    const tick = (now: number) => {
      const dt = Math.min(64, now - last)
      last = now
      const span = Math.max(0, frames.length - 1)
      const next = progressRef.current + (dt * speed) / BASE_FRAME_INTERVAL_MS
      if (next >= span) {
        progressRef.current = span
        setProgress(span)
        setIsPlaying(false)
        return
      }
      progressRef.current = next
      setProgress(next)
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isPlaying, speed, frames.length])

  return {
    scenario,
    setScenario,
    frames,
    /** Fractional node index. 0 is the first T-node; integers land exactly on a node. */
    progress,
    index: Math.round(progress),
    currentFrame,
    isPlaying,
    play: () => {
      if (progressRef.current >= frames.length - 1) seek(0)
      setIsPlaying(true)
    },
    pause: () => setIsPlaying(false),
    step: () => seek(Math.floor(progressRef.current + 1e-6) + 1),
    prev: () => seek(Math.ceil(progressRef.current - 1e-6) - 1),
    reset: () => {
      setIsPlaying(false)
      seek(0)
    },
    goTo: (i: number) => seek(i),
    speed,
    setSpeed,
  }
}
