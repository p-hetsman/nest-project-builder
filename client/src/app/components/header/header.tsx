import Link from 'next/link';
import navLinks from '@data/navigation';
import styles from './header.module.scss';

export default function Header() {
    return (
        <div>
            <header className={styles.header}>
                <div className={styles.container}>
                    <nav
                        className={`${styles.navbar} ${styles['navbar-default']}`}
                    >
                        <ul
                            className={`${styles.noBullets} ${styles.nav} ${styles['navbar-nav']} ${styles['navbar-right']}`}
                        >
                            {navLinks.map(link => (
                                <li className={styles['db-list']} key={link.id}>
                                    <Link href={link.link}>{link.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </header>
        </div>
    );
}
