import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from './TopBar'
import { useAuth } from '../../auth/AuthContext'
import './Shell.css'

const ROLE_LABEL = {
  resident: 'Resident',
  authority: 'Authority',
} as const

export default function Shell({ children }: { children: ReactNode }) {
  const { role, logout } = useAuth()
  const navigate = useNavigate()

  const handleSwitchRole = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="shell">
      <TopBar
        status={
          role && (
            <>
              <span className="shell__role">{ROLE_LABEL[role]}</span>
              <button className="shell__switch" onClick={handleSwitchRole}>
                Switch role
              </button>
            </>
          )
        }
      />
      <main className="shell__content">{children}</main>
    </div>
  )
}
