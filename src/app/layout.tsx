import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Salman Farse',
    description: 'Full-stack developer portfolio showcasing 3D web experiences, AI integration, and modern web technologies.',
    keywords: ['portfolio', 'web developer', 'full-stack', '3D', 'Three.js', 'React', 'Next.js', 'AI'],
    authors: [{ name: 'Salman Farse' }],
    openGraph: {
        title: 'Salman Farse',
        description: 'Full-stack developer portfolio showcasing 3D web experiences, AI integration, and modern web technologies.',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>{children}</body>
        </html>
    );
}
