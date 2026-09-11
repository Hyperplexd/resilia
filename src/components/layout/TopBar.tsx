import type { ReactNode } from 'react'
import './TopBar.css'

type TopBarProps = {
  /** Right-aligned slot for scenario time, live indicator, role switcher, etc. Phase 0: empty. */
  status?: ReactNode
}

export default function TopBar({ status }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <span className="topbar__mark" aria-hidden="true" />
        <span className="topbar__name">RESILIA</span>
        <span className="topbar__tag">Simulated scenario, not a live emergency feed</span>
      </div>
      <div className="topbar__status">{status}</div>
    </header>
  )
}
