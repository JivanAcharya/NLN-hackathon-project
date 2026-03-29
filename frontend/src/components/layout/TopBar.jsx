import styles from './TopBar.module.css';

export default function TopBar({ title, subtitle }) {
  return (
    <header className={styles.topBar}>
      <div className={styles.titleGroup}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      <div className={styles.actions}>
        <div className={styles.avatar} />
      </div>
    </header>
  );
}
