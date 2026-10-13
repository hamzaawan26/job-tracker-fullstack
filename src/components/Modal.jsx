import { useEffect, useEffectEvent, useRef } from 'react'
import styles from './Modal.module.css'

const focusableSelector = [
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export default function Modal({ children, onClose, isBusy = false }) {
  const dialogRef = useRef(null)
  const closeFromEffect = useEffectEvent(() => {
    if (!isBusy) onClose()
  })

  useEffect(() => {
    const previouslyFocused = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const dialog = dialogRef.current
    const firstField = dialog?.querySelector('input, select, textarea')
    const firstFocusable = dialog?.querySelector(focusableSelector)
    ;(firstField || firstFocusable || dialog)?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        closeFromEffect()
        return
      }
      if (event.key !== 'Tab' || !dialog) return

      const focusable = [...dialog.querySelectorAll(focusableSelector)]
      if (focusable.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [])

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget && !isBusy) onClose()
  }

  return (
    <div className={styles.overlay} onMouseDown={handleBackdropClick}>
      <div
        ref={dialogRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-form-title"
        aria-describedby="job-form-subtitle"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close job form"
          disabled={isBusy}
        >
          <span aria-hidden="true">&times;</span>
        </button>
        {children}
      </div>
    </div>
  )
}
