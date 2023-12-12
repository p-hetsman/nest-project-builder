import Head from 'next/head';
import ResizablePanels from '@components/resizable-panels/resizable-panels';
import '../styles/globals.css';

export default function Designer() {
    return (
        <>
            <Head>
                <title>Designer tool</title>
            </Head>
            <ResizablePanels />
        </>
    );
}
