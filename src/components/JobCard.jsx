import styles from './JobCard.module.css'

function JobCard({ job, onDelete, onEdit }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>{job.title}</h3>
        <span className={styles[job.status.toLowerCase()]}>{job.status}</span>
      </div>

      <p>{job.company}</p>
      <p>Applied: {job.dateApplied}</p>
      <p>Platform: {job.platform}</p>

      {job.jobLink && (
        <a href={job.jobLink} target="_blank">
          View Job
        </a>
      )}

      <div className={styles.actions}>
        <button onClick={() => onEdit(job)}>Edit</button>
        <button onClick={() => onDelete(job.id)}>Delete</button>
      </div>
    </div>
  )
}

export default JobCard
