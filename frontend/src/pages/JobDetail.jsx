import { Link, useParams } from 'react-router-dom'
import { useJobDetail } from '../hooks/useJobDetail'

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

function Field({ label, value }) {
  if (!value && value !== 0) return (
    <div>
      <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-400">—</dd>
    </div>
  )
  return (
    <div>
      <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{value}</dd>
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatSalary(min, max) {
  if (!min && !max) return null
  const fmt = n => n ? `$${n.toLocaleString()}` : null
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  return fmt(min) || fmt(max)
}

export default function JobDetail() {
  const { id } = useParams()
  const { job, loading, notFound } = useJobDetail(id)

  if (loading) {
    return (
      <div className="p-6">
        <Link to="/jobs" className="text-sm text-blue-600 hover:underline">← Back to Jobs</Link>
        <p className="mt-4 text-sm text-gray-400">Loading...</p>
      </div>
    )
  }

  if (notFound || !job) {
    return (
      <div className="p-6">
        <Link to="/jobs" className="text-sm text-blue-600 hover:underline">← Back to Jobs</Link>
        <p className="mt-4 text-sm text-gray-500">Job not found.</p>
      </div>
    )
  }

  const badgeClass = STATUS_BADGE[job.status] || 'bg-gray-100 text-gray-700'
  const recruiter = job.recruiter_info || {}

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/jobs" className="text-sm text-blue-600 hover:underline">← Back to Jobs</Link>
        <span className="text-xs text-gray-400">Added {formatDate(job.created_at)}</span>
      </div>

      {/* Title + status */}
      <div className="flex items-start gap-3 mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 leading-tight">{job.title}</h1>
        <span className={`mt-1 shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${badgeClass}`}>
          {job.status}
        </span>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Left column */}
        <div className="space-y-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-1">
            Job details
          </h2>
          <dl className="space-y-4">
            <Field label="Company" value={job.company} />
            <Field label="Location" value={job.location} />
            <Field label="Employment type" value={EMPLOYMENT_LABEL[job.employment_type] || job.employment_type} />
            <Field label="Vendor (staffing agency)" value={job.vendor} />
            <Field label="Client (end-client)" value={job.client} />
            <Field label="Salary range" value={formatSalary(job.salary_min, job.salary_max)} />
            <div>
              <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">Source URL</dt>
              <dd className="mt-0.5 text-sm">
                {job.source_url
                  ? <a href={job.source_url} target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all">{job.source_url}</a>
                  : <span className="text-gray-400">—</span>
                }
              </dd>
            </div>
          </dl>

          {/* Placeholders for future phases */}
          <div className="mt-6 pt-5 border-t border-gray-100 space-y-4">
            <div>
              <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">Fit score</dt>
              <dd className="mt-0.5 text-2xl font-semibold text-gray-300">
                {job.fit_score != null ? job.fit_score : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">Conflict</dt>
              <dd className="mt-0.5 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-200 inline-block" />
                <span className="text-sm text-gray-300">
                  {job.conflict_level || 'Not assessed'}
                </span>
              </dd>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Tech stack */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-1 mb-3">
              Tech stack
            </h2>
            {job.tech_stack && job.tech_stack.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {job.tech_stack.map((t, i) => (
                  <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">—</p>
            )}
          </div>

          {/* Recruiter info */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-1 mb-3">
              Recruiter
            </h2>
            {recruiter.name || recruiter.email || recruiter.phone ? (
              <dl className="space-y-2">
                {recruiter.name && <Field label="Name" value={recruiter.name} />}
                {recruiter.email && <Field label="Email" value={recruiter.email} />}
                {recruiter.phone && <Field label="Phone" value={recruiter.phone} />}
              </dl>
            ) : (
              <p className="text-sm text-gray-400">—</p>
            )}
          </div>

          {/* Job description */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-1 mb-3">
              Job description
            </h2>
            {job.raw_text ? (
              <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded p-3 max-h-72 overflow-y-auto">
                {job.raw_text}
              </pre>
            ) : (
              <p className="text-sm text-gray-400">—</p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
