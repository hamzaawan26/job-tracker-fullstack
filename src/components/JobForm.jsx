import { useState } from 'react'
import styles from './JobForm.module.css'

const emptyJob = {
  title: '',
  company: '',
  status: 'Applied',
  dateApplied: '',
  jobPostedDate: '',
  platform: '',
  jobLink: '',
  notes: '',
}

function JobForm({ onSubmit, editingJob, onCancel }) {
  const [formData, setFormData] = useState(() => editingJob || emptyJob)

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()

    onSubmit({
      title: formData.title,
      company: formData.company,
      status: formData.status.toLowerCase(),
      dateApplied: formData.dateApplied,
      datePosted: formData.jobPostedDate,
      platform: formData.platform,
      jobLink: formData.jobLink,
      notes: formData.notes,
    })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>{editingJob ? 'Edit Job' : 'Add Job'}</h2>

      <input
        name="title"
        placeholder="Job Title"
        value={formData.title}
        onChange={handleChange}
      />
      <input
        name="company"
        placeholder="Company"
        value={formData.company}
        onChange={handleChange}
      />

      <select name="status" value={formData.status} onChange={handleChange}>
        <option>Applied</option>
        <option>Interview</option>
        <option>Offer</option>
      </select>

      <input
        type="date"
        name="dateApplied"
        value={formData.dateApplied}
        onChange={handleChange}
      />
      <input
        type="date"
        name="jobPostedDate"
        value={formData.jobPostedDate}
        onChange={handleChange}
      />

      <input
        name="platform"
        placeholder="Platform (LinkedIn, Indeed…)"
        value={formData.platform}
        onChange={handleChange}
      />
      <input
        name="jobLink"
        placeholder="Job URL"
        value={formData.jobLink}
        onChange={handleChange}
      />

      <textarea
        name="notes"
        placeholder="Notes"
        value={formData.notes}
        onChange={handleChange}
      />

      <div className={styles.actions}>
        <button type="submit">{editingJob ? 'Update' : 'Add Job'}</button>
        {editingJob && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default JobForm
