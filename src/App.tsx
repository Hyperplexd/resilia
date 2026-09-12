import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login/Login'
import ResidentPage from './pages/Resident/Resident'
import AuthorityPage from './pages/Authority/Authority'
import SimulationPage from './pages/Simulation/Simulation'
import RequireRole from './auth/RequireRole'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/resident"
        element={
          <RequireRole role="resident">
            <ResidentPage />
          </RequireRole>
        }
      />
      <Route
        path="/authority"
        element={
          <RequireRole role="authority">
            <AuthorityPage />
          </RequireRole>
        }
      />
      <Route path="/simulation" element={<SimulationPage />} />
    </Routes>
  )
}
