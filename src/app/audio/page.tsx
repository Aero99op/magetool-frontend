'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    Music,
    RefreshCw,
    Scissors,
    Search,
    Download
} from 'lucide-react'

const tools = [
    {
        id: 'converter',
        title: 'Format Converter',
        description: 'Convert audio between MP3, WAV, OGG, FLAC, AAC formats',
        icon: RefreshCw,
        href: '/audio/converter',
    },
    {
        id: 'trimmer',
        title: 'Audio Trimmer',
        description: 'Trim and cut audio files with precision',
        icon: Scissors,
        href: '/audio/trimmer',
    },
    {
        id: 'finder',
        title: 'Audio Name Finder',
        description: 'Identify song name, artist, and metadata from audio',
        icon: Search,
        href: '/audio/finder',
    },
    {
        id: 'downloader',
        title: 'Audio Downloader',
        description: 'Download audio from various online sources',
        icon: Download,
        href: '/audio/downloader',
    },
]

export default function AudioPage() {
    return (
        <div className="min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                            <Music className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="section-title text-3xl lg:text-4xl">Audio Tools</h1>
                            <p className="text-[var(--text-muted)]">
                                Convert, trim, and identify your audio files
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tools.map((tool, index) => (
                        <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link href={tool.href}>
                                <div className="tool-card h-full group">
                                    <div className="tool-card-icon">
                                        <tool.icon className="w-6 h-6 text-[var(--premium-blue-400)]" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 group-hover:text-[var(--premium-blue-400)] transition-colors">
                                        {tool.title}
                                    </h3>
                                    <p className="text-[var(--text-muted)] text-sm">
                                        {tool.description}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
