import { useHealthDb } from '../hooks/useHealthDb'

export default function Dashboard() {
  const { status, loading, error } = useHealthDb()

  let badgeClass = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium '
  let badgeText = ''

  if (loading) {
    badgeClass += 'bg-gray-100 text-gray-600'
    badgeText = 'Checking database...'
  } else if (status === 'ok') {
    badgeClass += 'bg-green-100 text-green-600'
    badgeText = 'Database Connected'
  } else {
    badgeClass += 'bg-red-100 text-red-600'
    badgeText = 'Database Unreachable'
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Database status:</span>
        <span className={badgeClass}>{badgeText}</span>
      </div>
    </div>
  )
}
