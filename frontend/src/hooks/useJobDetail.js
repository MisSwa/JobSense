import { useState, useEffect } from 'react'

export function useJobDetail(id) {
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

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

  return { job, loading, notFound }
}
