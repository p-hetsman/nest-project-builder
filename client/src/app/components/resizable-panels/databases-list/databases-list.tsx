import Image from "next/image";
import databases from "@data/data";
import getImageUrl from "../../../utils/utils";
import styles from "./databases-list.module.scss";

export default function List({ onResourceStart }) {
  return (
    <div className={styles.sidebarContent}>
      <h2 className={styles["ds-select"]}> Resource types</h2>
      <ul className={styles.noBullets}>
        {databases.map((database) => (
          <li key={database.id} className={styles["db-list"]}>
            <Image
              src={getImageUrl(database)}
              alt={database.name}
              className={styles["db-list-im"]}
              draggable="true"
              onDragOver={(e) => e.preventDefault}
              onDragStart={(e) => onResourceStart(e)}
              width={60}
              height={60}
            />
            <b className={styles["ds-select"]}>{database.name}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
