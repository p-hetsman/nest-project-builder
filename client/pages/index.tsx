import Head from 'next/head';
import Footer from '@components/footer/footer';
import Home from './home/home';
import styles from '../styles/Home.module.css';
import '../styles/globals.css';

export default function Page() {
    return (
        <div className={styles.container}>
            <Head>
                <title>Developer app</title>
                <link href="/favicon.ico" rel="icon" />
            </Head>
            <Home />
            <Footer />
        </div>
    );
}
