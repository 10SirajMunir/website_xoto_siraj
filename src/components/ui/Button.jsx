import styles from './Button.module.css';

/** Class names for a button look, so PhaseLink and links can share it. */
export const buttonClass = (variant = 'primary', extra = '') => `${styles.btn} ${styles[variant]} ${extra}`;

export default function Button({ variant = 'primary', className = '', children, ...rest }) {
  return (
    <button type="button" className={buttonClass(variant, className)} {...rest}>
      {children}
    </button>
  );
}
