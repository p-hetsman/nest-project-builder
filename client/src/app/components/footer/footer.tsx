import Image from 'next/image';
import stylesGlobal from '../../../../styles/Home.module.css';

export default function Footer() {
    return (
        <footer>
            <a href="/#" rel="noopener noreferrer" target="_blank">
                Powered by{' '}
                <Image
                    alt="Vercel"
                    className={stylesGlobal.logo}
                    height={60}
                    src="/vercel.svg"
                    width={60}
                />
            </a>
        </footer>
    );
}
