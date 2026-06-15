import { useState } from 'react'
import { useProfile } from '../hooks/useProfile'

export default function Profile() {
  const { resumeText, setResumeText, loading } = useProfile()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

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
        <section>
          <h2 className="text-lg font-medium mb-3">Extracted resume text</h2>
          <pre className="bg-gray-50 border border-gray-200 rounded p-4 text-sm text-gray-700 whitespace-pre-wrap overflow-y-auto max-h-96">
            {resumeText}
          </pre>
        </section>
      )}
    </div>
  )
}
