import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login/Login'
import ResidentPage from './pages/Resident/Resident'
import AuthorityPage from './pages/Authority/Authority'
import SimulationPage from './pages/Simulation/Simulation'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/resident" element={<ResidentPage />} />
      <Route path="/authority" element={<AuthorityPage />} />
      <Route path="/simulation" element={<SimulationPage />} />
    </Routes>
  )
}
