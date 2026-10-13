import styles from './JobTrackerLoader.module.css'

export default function JobTrackerLoader({
  message = 'Preparing your workspace...',
  variant = 'inline',
}) {
  const isButton = variant === 'button'

  return (
    <div
      className={`${styles.loader} ${styles[variant]}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      {isButton ? (
        <span className={styles.buttonSpinner} aria-hidden="true" />
      ) : (
        <div className={styles.markWrap} aria-hidden="true">
          <span className={styles.ring} />
          <span className={styles.mark}>JT</span>
        </div>
      )}
      <div className={styles.copy}>
        {!isButton && <strong>JobTracker</strong>}
        <span>{message}</span>
      </div>
    </div>
  )
}
