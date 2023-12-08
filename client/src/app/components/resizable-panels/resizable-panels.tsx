"use client";

import React, { useEffect, useRef, useState } from "react";

import dynamic from "next/dynamic";
import List from "./databases-list/databases-list";
import styles from "./resizable-panels.module.scss";
import { resizableY } from "./resizable-y";
import { resizableX } from "./resizable-x";

const Canvas = dynamic(() => import("./canvas/canvas"), {
  ssr: false,
});

export default function ResizablePanels() {
  const refX = useRef<HTMLDivElement>(null);
  const refY = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState("");

  const handleDragStart = (e: {
    target: { src: React.SetStateAction<string> };
  }) => {
    setImageUrl(e.target.src);
  };

  useEffect(() => {
    const resizerX = refX.current;
    const resizerY = refY.current;

    resizableX(resizerX);
    resizableY(resizerY);
  }, []);

  return (
    <div id="app">
      <div className={styles["resizable-x"]}>
        <div className={styles.div0}>
          <List onResourceStart={handleDragStart} />
        </div>
        <div className={styles["resizer-x"]} ref={refX} />
        <div className={styles["resizable-y"]}>
          <div className={styles.div1}>
            <Canvas data={imageUrl} />
          </div>
          <div className={styles["resizer-y"]} ref={refY} />
          <div className={styles.div2}>JSON</div>
        </div>
      </div>
    </div>
  );
}
