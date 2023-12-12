import Head from 'next/head';
import { NextUIProvider } from '@nextui-org/react';
import Gen from '@components/generator-content/generator-content';
import '../styles/globals.css';

export default function Generator() {
    return (
        <NextUIProvider>
            <Head>
                <title>Generator tool</title>
            </Head>
            <div className="w-screen h-screen flex items-start justify-center  text-foreground bg-background">
                <Gen />
            </div>
        </NextUIProvider>
    );
}
