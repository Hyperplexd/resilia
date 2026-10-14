import { Navigate, Routes, Route } from 'react-router-dom'
import Login from './pages/Login/Login'
import SimulationPage from './pages/Simulation/Simulation'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/resident" element={<Navigate to="/simulation" replace />} />
      <Route path="/authority" element={<Navigate to="/simulation" replace />} />
      <Route path="/simulation" element={<SimulationPage />} />
    </Routes>
  )
}
