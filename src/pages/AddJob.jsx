// src/pages/AddJob.jsx
import { useCreateJob } from '../hooks/useJobs'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

export default function AddJob() {
  const create = useCreateJob()
  const nav = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      company: '',
      location: '',
      link: '',
      status: 'Applied',
      notes: '',
      tags: '',
    },
  })

  const onSubmit = (data) => {
    console.log('Submitting job:', data) // ✅ Confirm form is working

    const tags = data.tags
      ? data.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : []

    create.mutate(
      { ...data, tags },
      {
        onSuccess: () => {
          console.log('Job saved to LocalStorage ✅')
          nav('/')
        },
        onError: (err) => {
          console.error('Failed to save job ❌', err)
        },
      }
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          const job = {
            id: crypto.randomUUID(),
            title: 'Test Job',
            company: 'TestCo',
            status: 'Applied',
            createdAt: Date.now(),
          }
          const jobs = JSON.parse(localStorage.getItem('jobs') || '[]')
          jobs.unshift(job)
          localStorage.setItem('jobs', JSON.stringify(jobs))
          console.log('Manual job saved ✅')
        }}
      >
        Save Test Job Manually
      </button>
      <h2>Add Job</h2>
      <form
        onSubmit={handleSubmit(onSubmit)} // ✅ Correct form wiring
        style={{ display: 'grid', gap: '1rem', maxWidth: 600 }}
      >
        <label>
          Title
          <input {...register('title', { required: 'Title is required' })} />
          {errors.title && (
            <small style={{ color: 'crimson' }}>{errors.title.message}</small>
          )}
        </label>
        <label>
          Company
          <input
            {...register('company', { required: 'Company is required' })}
          />
          {errors.company && (
            <small style={{ color: 'crimson' }}>{errors.company.message}</small>
          )}
        </label>
        <label>
          Location
          <input {...register('location')} />
        </label>
        <label>
          Link
          <input
            {...register('link', {
              pattern: {
                value: /^https?:\/\//,
                message: 'Must be a valid URL',
              },
            })}
          />
          {errors.link && (
            <small style={{ color: 'crimson' }}>{errors.link.message}</small>
          )}
        </label>
        <label>
          Status
          <select {...register('status', { required: true })}>
            <option>Applied</option>
            <option>Interview</option>
            <option>Offer</option>
            <option>Rejected</option>
          </select>
        </label>
        <label>
          Notes
          <textarea rows={4} {...register('notes')} />
        </label>
        <label>
          Tags (comma-separated)
          <input placeholder="React, JS, Remote" {...register('tags')} />
        </label>
        <button type="submit">Save Job</button> {/* ✅ Must be type="submit" */}
      </form>
    </div>
  )
}
