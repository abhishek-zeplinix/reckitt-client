'use client';
import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import { AppWrapper } from '@/layout/AppWrapper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


interface RootLayoutProps {
    children: React.ReactNode;
}

const queryClient = new QueryClient();

export default function RootLayout({ children }: RootLayoutProps) {


    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link id="theme-css" href={`/themes/lara-light-indigo/theme.css`} rel="stylesheet"></link>
            </head>
            <body>
                <PrimeReactProvider>
                    <QueryClientProvider client={queryClient}>

                        <LayoutProvider>
                            {/* <LoaderProvider> */}
                            <AppWrapper className="scrollbar-style">
                                {children}
                            </AppWrapper>
                            {/* </LoaderProvider> */}
                        </LayoutProvider>
                        {/* {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />} */}
                    </QueryClientProvider>

                </PrimeReactProvider>
            </body>
        </html>
    );
}

