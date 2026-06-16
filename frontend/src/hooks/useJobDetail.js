import { useState, useEffect } from 'react'

export function useJobDetail(id, { onDeleted } = {}) {
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setNotFound(false)
    fetch(`/api/jobs/${id}`)
      .then(res => {
        if (res.status === 404) { setNotFound(true); return null }
        return res.json()
      })
      .then(data => { if (data) setJob(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  async function updateStatus(status) {
    setUpdating(true)
    setUpdateError(null)
    try {
      const res = await fetch(`/api/jobs/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) {
        setUpdateError(data.detail || 'Failed to update status.')
        return false
      }
      setJob(data)
      return true
    } catch {
      setUpdateError('Network error.')
      return false
    } finally {
      setUpdating(false)
    }
  }

  async function deleteJob() {
    setDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
      if (res.status === 204) {
        onDeleted?.()
        return
      }
      const data = await res.json().catch(() => ({}))
      setDeleteError(data.detail || 'Failed to delete job.')
    } catch {
      setDeleteError('Network error.')
    } finally {
      setDeleting(false)
    }
  }

  return { job, loading, notFound, updateStatus, updating, updateError, deleteJob, deleting, deleteError }
}
