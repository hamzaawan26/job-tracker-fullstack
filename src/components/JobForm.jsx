import { useState } from 'react'
import styles from './JobForm.module.css'

const emptyJob = {
  title: '', company: '', status: 'applied', dateApplied: '',
  jobPostedDate: '', platform: '', jobLink: '', notes: '',
}

function getInitialValues(job) {
  if (!job) return { ...emptyJob }
  return {
    ...emptyJob,
    ...job,
    status: job.status?.toLowerCase() || 'applied',
    jobPostedDate: job.jobPostedDate || job.datePosted || '',
  }
}

function isValidDate(value) {
  if (!value) return true
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

function isValidUrl(value) {
  if (!value) return true
  try {
    return ['http:', 'https:', 'ftp:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

function getApiError(error) {
  const response = error?.response?.data
  if (response?.errors?.length) return response.errors.map((item) => item.msg).join(' ')
  return response?.error || response?.message || error?.message || 'Unable to save the job. Please try again.'
}

function JobForm({ onSubmit, editingJob, onCancel, isSaving = false }) {
  const [formData, setFormData] = useState(() => getInitialValues(editingJob))
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }))
    setSubmitError('')
  }

  function validate() {
    const nextErrors = {}
    if (!formData.title.trim()) nextErrors.title = 'Job title is required.'
    if (!formData.company.trim()) nextErrors.company = 'Company name is required.'
    if (!isValidDate(formData.dateApplied)) nextErrors.dateApplied = 'Enter a valid application date.'
    if (!isValidDate(formData.jobPostedDate)) nextErrors.jobPostedDate = 'Enter a valid posted date.'
    if (!isValidUrl(formData.jobLink.trim())) nextErrors.jobLink = 'Enter a complete URL, such as https://example.com/job.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (isSaving || !validate()) return
    setSubmitError('')
    try {
      await onSubmit({
        title: formData.title.trim(),
        company: formData.company.trim(),
        status: formData.status,
        dateApplied: formData.dateApplied || undefined,
        datePosted: formData.jobPostedDate || undefined,
        platform: formData.platform.trim() || undefined,
        jobLink: formData.jobLink.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      })
    } catch (error) {
      setSubmitError(getApiError(error))
    }
  }

  const describedBy = (name) => (errors[name] ? `${name}-error` : undefined)

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <header className={styles.header}>
        <h2 id="job-form-title">{editingJob ? 'Edit Job' : 'Add New Job'}</h2>
        <p id="job-form-subtitle">{editingJob ? 'Update the details for this application.' : 'Add an opportunity to your application tracker.'}</p>
      </header>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor="job-title">Job Title <span aria-hidden="true">*</span></label>
          <input id="job-title" name="title" value={formData.title} onChange={handleChange} aria-invalid={Boolean(errors.title)} aria-describedby={describedBy('title')} autoComplete="organization-title" />
          {errors.title && <span id="title-error" className={styles.error}>{errors.title}</span>}
        </div>
        <div className={styles.field}>
          <label htmlFor="job-company">Company Name <span aria-hidden="true">*</span></label>
          <input id="job-company" name="company" value={formData.company} onChange={handleChange} aria-invalid={Boolean(errors.company)} aria-describedby={describedBy('company')} autoComplete="organization" />
          {errors.company && <span id="company-error" className={styles.error}>{errors.company}</span>}
        </div>
        <div className={styles.field}>
          <label htmlFor="job-status">Application Status</label>
          <select id="job-status" name="status" value={formData.status} onChange={handleChange}>
            <option value="applied">Applied</option><option value="interview">Interview</option><option value="offer">Offer</option>
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="job-platform">Platform</label>
          <input id="job-platform" name="platform" placeholder="LinkedIn, Indeed, referral…" value={formData.platform} onChange={handleChange} />
        </div>
        <div className={styles.field}>
          <label htmlFor="job-date-applied">Date Applied</label>
          <input id="job-date-applied" type="date" name="dateApplied" value={formData.dateApplied} onChange={handleChange} aria-invalid={Boolean(errors.dateApplied)} aria-describedby={describedBy('dateApplied')} />
          {errors.dateApplied && <span id="dateApplied-error" className={styles.error}>{errors.dateApplied}</span>}
        </div>
        <div className={styles.field}>
          <label htmlFor="job-date-posted">Job Posted Date</label>
          <input id="job-date-posted" type="date" name="jobPostedDate" value={formData.jobPostedDate} onChange={handleChange} aria-invalid={Boolean(errors.jobPostedDate)} aria-describedby={describedBy('jobPostedDate')} />
          {errors.jobPostedDate && <span id="jobPostedDate-error" className={styles.error}>{errors.jobPostedDate}</span>}
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label htmlFor="job-url">Job URL</label>
          <input id="job-url" type="url" name="jobLink" placeholder="https://company.com/jobs/role" value={formData.jobLink} onChange={handleChange} aria-invalid={Boolean(errors.jobLink)} aria-describedby={describedBy('jobLink')} />
          {errors.jobLink && <span id="jobLink-error" className={styles.error}>{errors.jobLink}</span>}
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label htmlFor="job-notes">Notes</label>
          <textarea id="job-notes" name="notes" placeholder="Add contacts, interview details, or follow-up reminders…" value={formData.notes} onChange={handleChange} rows="4" />
        </div>
      </div>

      {submitError && <div className={styles.submitError} role="alert">{submitError}</div>}
      <div className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={onCancel} disabled={isSaving}>Cancel</button>
        <button type="submit" className={styles.primary} disabled={isSaving}>{isSaving ? 'Saving…' : editingJob ? 'Save Changes' : 'Add Job'}</button>
      </div>
    </form>
  )
}

export default JobForm
