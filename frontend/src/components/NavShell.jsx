import { Link } from 'react-router-dom'
import { useHealth } from '../hooks/useHealth'

export default function NavShell() {
  const { status, loading, error } = useHealth()

  let badgeClass = 'px-2 py-1 rounded text-sm font-medium '
  let badgeText = ''

  if (loading) {
    badgeClass += 'bg-gray-100 text-gray-600'
    badgeText = 'Checking...'
  } else if (status === 'ok') {
    badgeClass += 'bg-green-100 text-green-600'
    badgeText = 'API online'
  } else {
    badgeClass += 'bg-red-100 text-red-600'
    badgeText = 'API offline'
  }

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
      <Link to="/" className="font-bold text-lg text-gray-900">JobSense</Link>
      <div className="flex items-center gap-4 text-sm">
        <Link to="/" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
        <Link to="/jobs" className="text-gray-600 hover:text-gray-900">Jobs</Link>
        <Link to="/discover" className="text-gray-600 hover:text-gray-900">Discover</Link>
        <Link to="/profile" className="text-gray-600 hover:text-gray-900">Profile</Link>
        <Link to="/suggestions" className="text-gray-600 hover:text-gray-900">Suggestions</Link>
        <Link to="/observability" className="text-gray-600 hover:text-gray-900">Observability</Link>
        <Link to="/search" className="text-gray-600 hover:text-gray-900">Search</Link>
      </div>
      <span className={badgeClass}>{badgeText}</span>
    </nav>
  )
}
