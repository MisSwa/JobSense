import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useJobs } from '../hooks/useJobs'

const EMPLOYMENT_OPTIONS = [
  { value: 'fte', label: 'FTE' },
  { value: 'contract', label: 'Contract' },
  { value: 'contract_to_hire', label: 'Contract-to-hire' },
  { value: 'part_time', label: 'Part-time' },
]

const STATUS_OPTIONS = [
  { value: 'discovered', label: 'Discovered' },
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
]

const CONFLICT_OPTIONS = [
  { value: 'green', label: 'Green' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'red', label: 'Red' },
]

const STATUS_BADGE = {
  discovered: 'bg-gray-100 text-gray-700',
  applied: 'bg-blue-100 text-blue-700',
  screening: 'bg-yellow-100 text-yellow-700',
  interview: 'bg-purple-100 text-purple-700',
  offer: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-500',
}

const EMPLOYMENT_LABEL = {
  fte: 'FTE',
  contract: 'Contract',
  contract_to_hire: 'Contract-to-hire',
  part_time: 'Part-time',
}

const EMPTY_FORM = {
  title: '',
  company: '',
  location: '',
  employment_type: '',
  vendor: '',
  client: '',
  salary_min: '',
  salary_max: '',
  tech_stack: '',
  source_url: '',
  recruiter_name: '',
  recruiter_email: '',
  recruiter_phone: '',
  raw_text: '',
}

function AddJobModal({ onClose, onSaved, createJob, creating, createError }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [titleError, setTitleError] = useState('')

  function set(field) {
    return e => setForm(p => ({ ...p, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) {
      setTitleError('Title is required.')
      return
    }
    setTitleError('')

    const payload = { title: form.title.trim() }
    if (form.company) payload.company = form.company
    if (form.location) payload.location = form.location
    if (form.employment_type) payload.employment_type = form.employment_type
    if (form.vendor) payload.vendor = form.vendor
    if (form.client) payload.client = form.client
    if (form.salary_min !== '') payload.salary_min = Number(form.salary_min)
    if (form.salary_max !== '') payload.salary_max = Number(form.salary_max)
    if (form.tech_stack) {
      payload.tech_stack = form.tech_stack.split(',').map(s => s.trim()).filter(Boolean)
    }
    if (form.source_url) payload.source_url = form.source_url
    if (form.recruiter_name) payload.recruiter_name = form.recruiter_name
    if (form.recruiter_email) payload.recruiter_email = form.recruiter_email
    if (form.recruiter_phone) payload.recruiter_phone = form.recruiter_phone
    if (form.raw_text) payload.raw_text = form.raw_text

    const job = await createJob(payload)
    if (job) onSaved(job)
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 overflow-y-auto py-10"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Add Job</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input type="text" value={form.title} onChange={set('title')}
              placeholder="e.g. Senior Engineer"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {titleError && <p className="mt-1 text-xs text-red-600">{titleError}</p>}
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input type="text" value={form.company} onChange={set('company')}
                placeholder="e.g. Acme Corp"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={form.location} onChange={set('location')}
                placeholder="e.g. Remote, New York"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employment type</label>
            <select value={form.employment_type} onChange={set('employment_type')}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— select —</option>
              {EMPLOYMENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor (staffing agency)</label>
              <input type="text" value={form.vendor} onChange={set('vendor')}
                placeholder="e.g. TechStaff Inc"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Client (end-client)</label>
              <input type="text" value={form.client} onChange={set('client')}
                placeholder="e.g. GlobalBank"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary min (USD)</label>
              <input type="number" value={form.salary_min} onChange={set('salary_min')}
                placeholder="e.g. 120000"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary max (USD)</label>
              <input type="number" value={form.salary_max} onChange={set('salary_max')}
                placeholder="e.g. 160000"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tech stack <span className="text-gray-400 font-normal">(comma-separated)</span>
            </label>
            <input type="text" value={form.tech_stack} onChange={set('tech_stack')}
              placeholder="e.g. Python, FastAPI, React"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job posting URL</label>
            <input type="text" value={form.source_url} onChange={set('source_url')}
              placeholder="https://..."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Recruiter name</label>
              <input type="text" value={form.recruiter_name} onChange={set('recruiter_name')}
                placeholder="Jane Smith"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Recruiter email</label>
              <input type="text" value={form.recruiter_email} onChange={set('recruiter_email')}
                placeholder="jane@example.com"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Recruiter phone</label>
              <input type="text" value={form.recruiter_phone} onChange={set('recruiter_phone')}
                placeholder="555-1234"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job description</label>
            <textarea value={form.raw_text} onChange={set('raw_text')} rows={5}
              placeholder="Paste the full job description here..."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
          </div>

          {createError && <p className="text-sm text-red-600">{createError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={creating}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50">
              {creating ? 'Saving...' : 'Save Job'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

function JobCard({ job }) {
  const badgeClass = STATUS_BADGE[job.status] || 'bg-gray-100 text-gray-700'
  const secondary = [job.company, job.location].filter(Boolean).join(' · ')

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-white border border-gray-200 rounded-lg px-5 py-4 flex items-start justify-between gap-4 hover:border-blue-300 hover:shadow-sm transition-shadow"
    >
      <div className="min-w-0">
        <p className="font-semibold text-gray-900 truncate">{job.title}</p>
        {secondary && <p className="text-sm text-gray-500 mt-0.5">{secondary}</p>}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeClass}`}>
            {job.status}
          </span>
          {job.employment_type && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {EMPLOYMENT_LABEL[job.employment_type] || job.employment_type}
            </span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-gray-400 mb-1">Fit score</p>
        <p className="text-lg font-semibold text-gray-300">
          {job.fit_score != null ? job.fit_score : '—'}
        </p>
      </div>
    </Link>
  )
}

export default function Jobs() {
  const { jobs, loading, fetchError, fetchJobs, createJob, creating, createError } = useJobs()
  const [filters, setFilters] = useState({ status: '', employment_type: '', conflict_level: '' })
  const [modalOpen, setModalOpen] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)

  useEffect(() => {
    fetchJobs(filters)
  }, [fetchJobs, filters])

  function handleFilterChange(field) {
    return e => setFilters(prev => ({ ...prev, [field]: e.target.value }))
  }

  function handleSaved(newJob) {
    setModalOpen(false)
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 2000)
    fetchJobs(filters)
  }

  const hasFilters = filters.status || filters.employment_type || filters.conflict_level

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Jobs</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
        >
          + Add Job
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <select
          value={filters.status}
          onChange={handleFilterChange('status')}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={filters.employment_type}
          onChange={handleFilterChange('employment_type')}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All types</option>
          {EMPLOYMENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={filters.conflict_level}
          onChange={handleFilterChange('conflict_level')}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All conflict levels</option>
          {CONFLICT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {savedMsg && (
        <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 inline-block">
          Job saved.
        </p>
      )}

      {fetchError && (
        <p className="mb-4 text-sm text-red-600">{fetchError}</p>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : jobs.length === 0 ? (
        <p className="text-sm text-gray-500">
          {hasFilters
            ? 'No jobs match the current filters.'
            : 'No jobs yet. Click "+ Add Job" to get started.'}
        </p>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => <JobCard key={job.id} job={job} />)}
        </div>
      )}

      {modalOpen && (
        <AddJobModal
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
          createJob={createJob}
          creating={creating}
          createError={createError}
        />
      )}
    </div>
  )
}
