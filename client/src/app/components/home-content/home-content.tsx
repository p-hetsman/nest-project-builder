import Link from "next/link";
import stylesGlobal from "../../../../styles/Home.module.css";

export default function HomeContent() {
  return (
    <main>
      <h1 className={stylesGlobal.title}>
        Try <Link href="/designer">application designer tool</Link>
      </h1>

      <p className={stylesGlobal.description}>
        Business applications in minutes
      </p>
      <div className={stylesGlobal.grid}>
        <Link href="/generator" className={stylesGlobal.card}>
          <h3>Generate your app &rarr;</h3>
        </Link>
      </div>
    </main>
  );
}
