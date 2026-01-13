import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import Navbar from '@/components/layout/Navbar'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
})

export const metadata: Metadata = {
    title: 'Magetool - All-in-One File Manipulation Hub',
    description: 'The ultimate tool app for images, videos, audio, and files. Convert, edit, and transform your media with powerful AI-powered features.',
    keywords: ['file converter', 'image editor', 'video downloader', 'audio converter', 'PDF tools', 'background remover', 'OCR'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="antialiased">
                <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1">
                        {children}
                    </main>
                    <footer className="glass-panel border-t border-b-0 rounded-none py-6 mt-auto">
                        <div className="max-w-7xl mx-auto px-6 text-center">
                            <p className="text-[var(--text-muted)] text-sm">
                                © 2024 Magetool. All rights reserved. Built with ❤️ for creators.
                            </p>
                        </div>
                    </footer>
                </div>
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            background: 'var(--black-surface)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-primary)',
                        },
                    }}
                />
            </body>
        </html>
    )
}
