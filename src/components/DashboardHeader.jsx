import styles from './DashboardHeader.module.css'

export default function DashboardHeader({ user, jobs }) {
  const applied = jobs.filter((j) => j.status === 'applied').length
  const interviews = jobs.filter((j) => j.status === 'interview').length
  const offers = jobs.filter((j) => j.status === 'offer').length

  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <h1>Dashboard</h1>
        <p>Welcome back, {user.email}</p>
      </div>

      <div className={styles.right}>
        <div className={styles.stat}>
          <h3>{jobs.length}</h3>
          <span>Total</span>
        </div>
        <div className={styles.stat}>
          <h3>{applied}</h3>
          <span>Applied</span>
        </div>
        <div className={styles.stat}>
          <h3>{interviews}</h3>
          <span>Interviews</span>
        </div>
        <div className={styles.stat}>
          <h3>{offers}</h3>
          <span>Offers</span>
        </div>
      </div>
    </div>
  )
}
