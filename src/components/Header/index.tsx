import Link from "next/link";
import styles from './header.module.scss';

interface HeaderProps {
  className?: string;
}

export default function Header({ ...className }:HeaderProps) {
  return (
    <header className={`${className} ${styles.headerContainer}`}>
      <div className={styles.headerContent}>
        <Link href="/" passHref>
          <a href="/">
            <img src="/images/logo.svg" alt="logo" />
          </a>
        </Link>
      </div>
    </header>
  )
}
