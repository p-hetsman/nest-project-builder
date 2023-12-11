import Gen from "@components/generator-content/generator-content";
import "../styles/globals.css";
import { NextUIProvider } from "@nextui-org/react";

export default function Designer() {
  return (
    <NextUIProvider>
      <div className="w-screen h-screen flex items-start justify-center  text-foreground bg-background">
        <Gen />
      </div>
    </NextUIProvider>
  )
}
