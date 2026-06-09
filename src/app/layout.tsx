import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'AI Presentation Generator',
    description: 'AI presentation generator powered by Weam.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
