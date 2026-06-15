import { useState, useEffect } from 'react'

export function usePreferences() {
  const [preferences, setPreferences] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    fetch('/api/profile/preferences')
      .then(res => res.json())
      .then(data => setPreferences(data))
      .catch(() => {})
  }, [])

  async function savePreferences(data) {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/profile/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) {
        setSaveError(result.detail || 'Save failed.')
        return false
      }
      setPreferences(result)
      return true
    } catch {
      setSaveError('Network error. Is the backend running?')
      return false
    } finally {
      setSaving(false)
    }
  }

  return { preferences, savePreferences, saving, saveError }
}
