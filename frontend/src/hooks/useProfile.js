import { useState, useEffect } from 'react'

export function useProfile() {
  const [resumeText, setResumeText] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => { setResumeText(data.resume_text); setLoading(false) })
      .catch(err => { setError(err); setLoading(false) })
  }, [])

  return { resumeText, setResumeText, loading, error }
}
