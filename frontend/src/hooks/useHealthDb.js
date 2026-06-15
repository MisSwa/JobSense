import { useState, useEffect } from 'react'

export function useHealthDb() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/health/db')
      .then(r => {
        if (!r.ok) return r.json().then(data => Promise.reject(data))
        return r.json()
      })
      .then(data => { setStatus(data.status); setLoading(false) })
      .catch(err => { setError(err); setLoading(false) })
  }, [])

  return { status, loading, error }
}
