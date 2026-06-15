import { useState } from 'react'

export function useJobs() {
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)

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

  return { createJob, creating, createError }
}
