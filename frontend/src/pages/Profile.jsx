import { useState, useEffect } from 'react'
import { useProfile } from '../hooks/useProfile'
import { usePreferences } from '../hooks/usePreferences'
import { useRestrictions } from '../hooks/useRestrictions'

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
  const { restrictions, saveRestrictions, saving: savingR, saveError: saveErrorR } = useRestrictions()
  const [restrictionsForm, setRestrictionsForm] = useState({
    current_client: '',
    current_vendor: '',
    restricted_clients: '',
    restricted_vendors: '',
    noncompete_industries: '',
    noncompete_locations: '',
    contract_end_date: '',
  })
  const [savedMsgR, setSavedMsgR] = useState(false)
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

  // Pre-populate restrictions form when restrictions load
  useEffect(() => {
    setRestrictionsForm({
      current_client: restrictions.current_client || '',
      current_vendor: restrictions.current_vendor || '',
      restricted_clients: arrToStr(restrictions.restricted_clients),
      restricted_vendors: arrToStr(restrictions.restricted_vendors),
      noncompete_industries: arrToStr(restrictions.noncompete_industries),
      noncompete_locations: arrToStr(restrictions.noncompete_locations),
      contract_end_date: restrictions.contract_end_date || '',
    })
  }, [restrictions])

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

  async function handleSaveRestrictions(e) {
    e.preventDefault()
    const payload = {}
    if (restrictionsForm.current_client) payload.current_client = restrictionsForm.current_client
    if (restrictionsForm.current_vendor) payload.current_vendor = restrictionsForm.current_vendor
    if (restrictionsForm.restricted_clients) payload.restricted_clients = strToArr(restrictionsForm.restricted_clients)
    if (restrictionsForm.restricted_vendors) payload.restricted_vendors = strToArr(restrictionsForm.restricted_vendors)
    if (restrictionsForm.noncompete_industries) payload.noncompete_industries = strToArr(restrictionsForm.noncompete_industries)
    if (restrictionsForm.noncompete_locations) payload.noncompete_locations = strToArr(restrictionsForm.noncompete_locations)
    if (restrictionsForm.contract_end_date) payload.contract_end_date = restrictionsForm.contract_end_date

    const ok = await saveRestrictions(payload)
    if (ok) {
      setSavedMsgR(true)
      setTimeout(() => setSavedMsgR(false), 2000)
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

      <section className="mb-8">
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

      <section>
        <h2 className="text-lg font-medium mb-4">Contract Restrictions</h2>
        <form onSubmit={handleSaveRestrictions} className="space-y-5">

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Current client</label>
              <input
                type="text"
                value={restrictionsForm.current_client}
                onChange={e => setRestrictionsForm(p => ({ ...p, current_client: e.target.value }))}
                placeholder="e.g. Acme Corp"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Current vendor</label>
              <input
                type="text"
                value={restrictionsForm.current_vendor}
                onChange={e => setRestrictionsForm(p => ({ ...p, current_vendor: e.target.value }))}
                placeholder="e.g. TechStaff Inc"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Restricted clients <span className="text-gray-400 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={restrictionsForm.restricted_clients}
              onChange={e => setRestrictionsForm(p => ({ ...p, restricted_clients: e.target.value }))}
              placeholder="e.g. GlobalBank, MegaCorp"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Restricted vendors <span className="text-gray-400 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={restrictionsForm.restricted_vendors}
              onChange={e => setRestrictionsForm(p => ({ ...p, restricted_vendors: e.target.value }))}
              placeholder="e.g. QuickHire LLC"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Non-compete industries <span className="text-gray-400 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={restrictionsForm.noncompete_industries}
              onChange={e => setRestrictionsForm(p => ({ ...p, noncompete_industries: e.target.value }))}
              placeholder="e.g. Finance, Healthcare"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Non-compete locations <span className="text-gray-400 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={restrictionsForm.noncompete_locations}
              onChange={e => setRestrictionsForm(p => ({ ...p, noncompete_locations: e.target.value }))}
              placeholder="e.g. New York, Boston"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">Contract end date</label>
            <input
              type="date"
              value={restrictionsForm.contract_end_date}
              onChange={e => setRestrictionsForm(p => ({ ...p, contract_end_date: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={savingR}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {savingR ? 'Saving...' : savedMsgR ? 'Saved' : 'Save Restrictions'}
            </button>
            {saveErrorR && (
              <p className="text-sm text-red-600">{saveErrorR}</p>
            )}
          </div>

        </form>
      </section>
    </div>
  )
}
