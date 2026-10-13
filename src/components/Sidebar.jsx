import styles from './Sidebar.module.css'

export default function Sidebar({ onAddJob }) {
  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.logo}>JobTracker</h2>

      <button className={styles.addBtn} onClick={onAddJob}>
        + Add Job
      </button>

      <nav>
        <p>Dashboard</p>
        <p>Applications</p>
        <p>Skills</p>
      </nav>
    </aside>
  )
}
