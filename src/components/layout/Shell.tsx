import type { ReactNode } from 'react'
import TopBar from './TopBar'
import './Shell.css'

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <TopBar />
      <main className="shell__content">{children}</main>
    </div>
  )
}
