import styles from './styles.module.scss';
import Link from 'next/link';

function PreviewButton() {
  return (
    <Link href="/api/exit-preview">
      <a
      type="button"
      className={styles.buttonPreview}>
        Sair do modo Preview
      </a>
    </Link>
  )
}

export default PreviewButton
