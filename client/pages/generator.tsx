import Head from 'next/head';
import { NextUIProvider } from '@nextui-org/react';
import Gen from '@components/generator-content/generator-content';
import { QueryClient, QueryClientProvider } from 'react-query';
import '../styles/globals.css';
const queryClient = new QueryClient();

export default function Generator() {
    return (
        <NextUIProvider>
            <Head>
                <title>Generator tool</title>
            </Head>
            <QueryClientProvider client={queryClient}>
                <div className="w-screen h-screen flex items-start justify-center  text-foreground bg-background m-top-4">
                    <Gen />
                </div>
            </QueryClientProvider>
        </NextUIProvider>
    );
}
