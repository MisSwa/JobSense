import { useState, useEffect } from 'react'

export function useRestrictions() {
  const [restrictions, setRestrictions] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    fetch('/api/profile/restrictions')
      .then(res => res.json())
      .then(data => setRestrictions(data))
      .catch(() => {})
  }, [])

  async function saveRestrictions(data) {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/profile/restrictions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) {
        setSaveError(result.detail || 'Save failed.')
        return false
      }
      setRestrictions(result)
      return true
    } catch {
      setSaveError('Network error. Is the backend running?')
      return false
    } finally {
      setSaving(false)
    }
  }

  return { restrictions, saveRestrictions, saving, saveError }
}
