import { useState, useEffect } from 'react'

export function useHealth() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/health')
      .then(r => r.json())
      .then(data => { setStatus(data.status); setLoading(false) })
      .catch(err => { setError(err); setLoading(false) })
  }, [])

  return { status, loading, error }
}
