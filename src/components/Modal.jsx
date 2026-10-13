import styles from './Modal.module.css'

export default function Modal({ children, onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose}>
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}
