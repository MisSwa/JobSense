import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavShell from './components/NavShell'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import Suggestions from './pages/Suggestions'
import Observability from './pages/Observability'
import Search from './pages/Search'

export default function App() {
  return (
    <BrowserRouter>
      <NavShell />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/suggestions" element={<Suggestions />} />
        <Route path="/observability" element={<Observability />} />
        <Route path="/search" element={<Search />} />
      </Routes>
    </BrowserRouter>
  )
}
