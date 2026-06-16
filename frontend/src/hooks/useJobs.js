import { useState, useCallback } from 'react'

export function useJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)

  const fetchJobs = useCallback(async (filters = {}) => {
    setLoading(true)
    setFetchError(null)
    try {
      const params = new URLSearchParams()
      if (filters.status) params.set('status', filters.status)
      if (filters.employment_type) params.set('employment_type', filters.employment_type)
      if (filters.conflict_level) params.set('conflict_level', filters.conflict_level)
      const url = `/api/jobs${params.toString() ? '?' + params.toString() : ''}`
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) {
        setFetchError(data.detail || 'Failed to load jobs.')
        return
      }
      setJobs(data)
    } catch {
      setFetchError('Network error. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [])

  async function createJob(data) {
    setCreating(true)
    setCreateError(null)
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) {
        setCreateError(result.detail || 'Failed to save job.')
        return null
      }
      return result
    } catch {
      setCreateError('Network error. Is the backend running?')
      return null
    } finally {
      setCreating(false)
    }
  }

  return { jobs, loading, fetchError, fetchJobs, createJob, creating, createError }
}
