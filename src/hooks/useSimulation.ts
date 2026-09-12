import { useEffect, useMemo, useRef, useState } from 'react'
import { runSimulation } from '../simulation/simulationEngine'
import { DEFAULT_SCENARIO, TIME_POINTS } from '../simulation/scenarios'
import type { LngLat, ScenarioInput } from '../simulation/simulationTypes'

export type PlaybackSpeed = 1 | 2 | 5 | 10

const BASE_FRAME_INTERVAL_MS = 1400

export function useSimulation(ignition: LngLat) {
  const [scenario, setScenarioState] = useState<ScenarioInput>(DEFAULT_SCENARIO)
  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<PlaybackSpeed>(1)
  const timerRef = useRef<number | null>(null)

  const frames = useMemo(() => runSimulation(ignition, scenario, TIME_POINTS), [ignition, scenario])

  // Changing the scenario invalidates the current run — restart at T+00
  // rather than showing a stale index against newly computed frames.
  const setScenario = (next: ScenarioInput) => {
    setScenarioState(next)
    setIndex(0)
    setIsPlaying(false)
  }

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) window.clearInterval(timerRef.current)
      return
    }
    timerRef.current = window.setInterval(() => {
      setIndex((i) => {
        if (i >= frames.length - 1) {
          setIsPlaying(false)
          return i
        }
        return i + 1
      })
    }, BASE_FRAME_INTERVAL_MS / speed)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [isPlaying, speed, frames.length])

  return {
    scenario,
    setScenario,
    frames,
    index,
    currentFrame: frames[index],
    isPlaying,
    play: () => {
      setIndex((i) => (i >= frames.length - 1 ? 0 : i))
      setIsPlaying(true)
    },
    pause: () => setIsPlaying(false),
    step: () => setIndex((i) => Math.min(i + 1, frames.length - 1)),
    prev: () => setIndex((i) => Math.max(i - 1, 0)),
    reset: () => {
      setIsPlaying(false)
      setIndex(0)
    },
    goTo: (i: number) => setIndex(Math.max(0, Math.min(i, frames.length - 1))),
    speed,
    setSpeed,
  }
}
