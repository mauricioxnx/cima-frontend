import styles from './UI.module.css'
import { X } from 'lucide-react'

export function Card({ children, className = '', style }) {
  return <div className={`${styles.card} ${className}`} style={style}>{children}</div>
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className={styles.cardHeader}>
      <div>
        <div className={styles.cardTitle}>{title}</div>
        {subtitle && <div className={styles.cardSubtitle}>{subtitle}</div>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function Badge({ children, variant = 'default' }) {
  return <span className={`${styles.badge} ${styles[`badge_${variant}`]}`}>{children}</span>
}

export function Button({ children, variant = 'default', onClick, disabled, size = 'md', icon: Icon }) {
  return (
    <button
      className={`${styles.btn} ${styles[`btn_${variant}`]} ${styles[`btn_${size}`]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon size={13} />}
      {children}
    </button>
  )
}

export function Spinner() {
  return <div className={styles.spinner} />
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>{title}</h1>
        {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function StatCard({ label, value, delta, deltaType = 'neutral', icon: Icon, accent }) {
  return (
    <div className={styles.statCard} style={accent ? {'--card-accent': accent} : {}}>
      <div className={styles.statTop}>
        <div className={styles.statLabel}>{label}</div>
        {Icon && <div className={styles.statIcon}><Icon size={14} /></div>}
      </div>
      <div className={styles.statValue}>{value ?? '—'}</div>
      {delta && (
        <div className={`${styles.statDelta} ${styles[`delta_${deltaType}`]}`}>{delta}</div>
      )}
    </div>
  )
}

export function DataTable({ columns, data, loading, emptyText = 'Sem dados' }) {
  if (loading) return <div className={styles.tableLoading}><Spinner /></div>
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c.key} style={{ width: c.width }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.length === 0 && (
            <tr><td colSpan={columns.length} className={styles.emptyCell}>{emptyText}</td></tr>
          )}
          {data?.map((row, i) => (
            <tr key={i}>
              {columns.map(c => (
                <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} style={{ maxWidth: width }} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>{title}</div>
          <button className={styles.modalClose} onClick={onClose}><X size={15} /></button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  )
}

export function FormField({ label, error, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      {children}
      {error && <div className={styles.fieldError}>{error}</div>}
    </div>
  )
}

export function Input({ ...props }) {
  return <input className={styles.input} {...props} />
}

export function Select({ children, ...props }) {
  return <select className={styles.select} {...props}>{children}</select>
}

export function Textarea({ ...props }) {
  return <textarea className={styles.textarea} {...props} />
}
