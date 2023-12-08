import Image from "next/image";
import stylesGlobal from "../../../../styles/Home.module.css";

export default function Footer() {
  return (
    <footer>
      <a href="/#" target="_blank" rel="noopener noreferrer">
        Powered by{" "}
        <Image
          src="/vercel.svg"
          alt="Vercel"
          className={stylesGlobal.logo}
          width={60}
          height={60}
        />
      </a>
    </footer>
  );
}
