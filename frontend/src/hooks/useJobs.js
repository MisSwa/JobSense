import { useState, useCallback } from 'react'

export function useJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)
  const [activeCount, setActiveCount] = useState(null)
  const [archiveCount, setArchiveCount] = useState(null)

  const fetchJobs = useCallback(async (filters = {}) => {
    setLoading(true)
    setFetchError(null)
    try {
      const params = new URLSearchParams()
      if (filters.view) params.set('view', filters.view)
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

  const fetchCounts = useCallback(async () => {
    try {
      const [activeRes, archiveRes] = await Promise.all([
        fetch('/api/jobs?view=active'),
        fetch('/api/jobs?view=archive'),
      ])
      const [activeData, archiveData] = await Promise.all([
        activeRes.json(),
        archiveRes.json(),
      ])
      if (activeRes.ok) setActiveCount(activeData.length)
      if (archiveRes.ok) setArchiveCount(archiveData.length)
    } catch {
      // counts are non-critical
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

  async function reopenJob(id) {
    try {
      const res = await fetch(`/api/jobs/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'discovered' }),
      })
      return res.ok
    } catch {
      return false
    }
  }

  return {
    jobs, loading, fetchError, fetchJobs,
    createJob, creating, createError,
    fetchCounts, activeCount, archiveCount,
    reopenJob,
  }
}
