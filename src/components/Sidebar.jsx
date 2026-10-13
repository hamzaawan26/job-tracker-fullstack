
import styles from './Sidebar.module.css'

export default function Sidebar({ onAddJob }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandIcon}>JT</div>
        <span>JobTracker</span>
      </div>

      <div className={styles.menuLabel}>WORKSPACE</div>

      <nav className={styles.menu} aria-label="Dashboard navigation">
        <a className={styles.active} href="#dashboard">
          <span>▦</span> Dashboard
        </a>
        <a className={styles.item} href="#applications">
          <span>▤</span> Applications
        </a>
        <a className={styles.item} href="#skills">
          <span>◈</span> Skills
        </a>
      </nav>

      <button
        type="button"
        className={styles.addBtn}
        onClick={onAddJob}
      >
        <span>＋</span> Add New Job
      </button>

      <div className={styles.footer}>
        JobTracker
        <span>Manage your career journey</span>
      </div>
    </aside>
  )
}
