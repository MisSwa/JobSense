import { useState, useEffect } from 'react'
import { useProfile } from '../hooks/useProfile'
import { usePreferences } from '../hooks/usePreferences'

const EMPLOYMENT_OPTIONS = [
  { value: 'fte', label: 'FTE' },
  { value: 'contract', label: 'Contract' },
  { value: 'contract_to_hire', label: 'Contract-to-hire' },
  { value: 'part_time', label: 'Part-time' },
]

const REMOTE_OPTIONS = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'Onsite' },
]

function arrToStr(arr) {
  return Array.isArray(arr) ? arr.join(', ') : (arr || '')
}

function strToArr(str) {
  return str
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
}

export default function Profile() {
  const { resumeText, setResumeText, loading } = useProfile()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  const { preferences, savePreferences, saving, saveError } = usePreferences()
  const [form, setForm] = useState({
    target_titles: '',
    employment_types: [],
    remote_preference: '',
    target_locations: '',
    salary_min: '',
    salary_max: '',
    target_industries: '',
    target_skills: '',
  })
  const [savedMsg, setSavedMsg] = useState(false)

  // Pre-populate form when preferences load
  useEffect(() => {
    setForm({
      target_titles: arrToStr(preferences.target_titles),
      employment_types: preferences.employment_types || [],
      remote_preference: preferences.remote_preference || '',
      target_locations: arrToStr(preferences.target_locations),
      salary_min: preferences.salary_min ?? '',
      salary_max: preferences.salary_max ?? '',
      target_industries: arrToStr(preferences.target_industries),
      target_skills: arrToStr(preferences.target_skills),
    })
  }, [preferences])

  async function handleUpload(e) {
    e.preventDefault()
    const file = e.target.elements.file.files[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/profile/resume', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        setUploadError(data.detail || 'Upload failed.')
      } else {
        setResumeText(data.resume_text)
      }
    } catch {
      setUploadError('Network error. Is the backend running?')
    } finally {
      setUploading(false)
    }
  }

  function handleEmploymentToggle(value) {
    setForm(prev => {
      const current = prev.employment_types
      return {
        ...prev,
        employment_types: current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value],
      }
    })
  }

  async function handleSavePreferences(e) {
    e.preventDefault()
    const payload = {}
    if (form.target_titles) payload.target_titles = strToArr(form.target_titles)
    if (form.employment_types.length) payload.employment_types = form.employment_types
    if (form.remote_preference) payload.remote_preference = form.remote_preference
    if (form.target_locations) payload.target_locations = strToArr(form.target_locations)
    if (form.salary_min !== '') payload.salary_min = Number(form.salary_min)
    if (form.salary_max !== '') payload.salary_max = Number(form.salary_max)
    if (form.target_industries) payload.target_industries = strToArr(form.target_industries)
    if (form.target_skills) payload.target_skills = strToArr(form.target_skills)

    const ok = await savePreferences(payload)
    if (ok) {
      setSavedMsg(true)
      setTimeout(() => setSavedMsg(false), 2000)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Profile</h1>

      <section className="mb-8">
        <h2 className="text-lg font-medium mb-3">Resume</h2>
        <form onSubmit={handleUpload} className="flex items-center gap-3">
          <input
            type="file"
            name="file"
            accept=".pdf,.docx"
            className="text-sm text-gray-600"
          />
          <button
            type="submit"
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Resume'}
          </button>
        </form>
        {uploadError && (
          <p className="mt-2 text-sm text-red-600">{uploadError}</p>
        )}
      </section>

      {!loading && resumeText && (
        <section className="mb-8">
          <h2 className="text-lg font-medium mb-3">Extracted resume text</h2>
          <pre className="bg-gray-50 border border-gray-200 rounded p-4 text-sm text-gray-700 whitespace-pre-wrap overflow-y-auto max-h-96">
            {resumeText}
          </pre>
        </section>
      )}

      <section>
        <h2 className="text-lg font-medium mb-4">Job Preferences</h2>
        <form onSubmit={handleSavePreferences} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target titles <span className="text-gray-400 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={form.target_titles}
              onChange={e => setForm(p => ({ ...p, target_titles: e.target.value }))}
              placeholder="e.g. Senior Engineer, Staff Engineer"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">Employment types</span>
            <div className="flex flex-wrap gap-4">
              {EMPLOYMENT_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.employment_types.includes(opt.value)}
                    onChange={() => handleEmploymentToggle(opt.value)}
                    className="rounded"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">Remote preference</span>
            <div className="flex gap-4">
              {REMOTE_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="remote_preference"
                    value={opt.value}
                    checked={form.remote_preference === opt.value}
                    onChange={e => setForm(p => ({ ...p, remote_preference: e.target.value }))}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target locations <span className="text-gray-400 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={form.target_locations}
              onChange={e => setForm(p => ({ ...p, target_locations: e.target.value }))}
              placeholder="e.g. New York, San Francisco"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary min (USD)</label>
              <input
                type="number"
                value={form.salary_min}
                onChange={e => setForm(p => ({ ...p, salary_min: e.target.value }))}
                placeholder="e.g. 150000"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary max (USD)</label>
              <input
                type="number"
                value={form.salary_max}
                onChange={e => setForm(p => ({ ...p, salary_max: e.target.value }))}
                placeholder="e.g. 200000"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target industries <span className="text-gray-400 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={form.target_industries}
              onChange={e => setForm(p => ({ ...p, target_industries: e.target.value }))}
              placeholder="e.g. Fintech, Healthcare"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target skills <span className="text-gray-400 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={form.target_skills}
              onChange={e => setForm(p => ({ ...p, target_skills: e.target.value }))}
              placeholder="e.g. Python, FastAPI, React"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : savedMsg ? 'Saved' : 'Save Preferences'}
            </button>
            {saveError && (
              <p className="text-sm text-red-600">{saveError}</p>
            )}
          </div>

        </form>
      </section>
    </div>
  )
}
