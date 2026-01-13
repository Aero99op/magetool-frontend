'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    Image,
    Video,
    Music,
    FileText,
    Sparkles,
    Wand2,
    Download,
    Scissors,
    FileSearch,
    Zap
} from 'lucide-react'

const categories = [
    {
        id: 'images',
        title: 'Image Tools',
        description: 'Convert, crop, remove backgrounds, upscale, and apply filters to your images.',
        icon: Image,
        href: '/images',
        tools: ['Converter', 'Cropper', 'BG Remover', 'Upscaler', 'Collage', 'OCR'],
        gradient: 'from-blue-500 to-cyan-500',
    },
    {
        id: 'videos',
        title: 'Video Tools',
        description: 'Download from YouTube, Instagram, TikTok. Convert and extract audio.',
        icon: Video,
        href: '/videos',
        tools: ['YouTube DL', 'Instagram DL', 'Converter', 'Audio Extract', 'Shorts DL'],
        gradient: 'from-purple-500 to-pink-500',
    },
    {
        id: 'audio',
        title: 'Audio Tools',
        description: 'Convert audio formats, trim tracks, and identify music.',
        icon: Music,
        href: '/audio',
        tools: ['Converter', 'Trimmer', 'Name Finder', 'Downloader'],
        gradient: 'from-green-500 to-emerald-500',
    },
    {
        id: 'files',
        title: 'File Tools',
        description: 'Convert documents, merge PDFs, extract text with OCR.',
        icon: FileText,
        href: '/files',
        tools: ['Converter', 'PDF Merge', 'PDF Split', 'OCR Scan', 'Editor'],
        gradient: 'from-orange-500 to-amber-500',
    },
]

const features = [
    {
        icon: Zap,
        title: 'Lightning Fast',
        description: 'Process up to 40 files at once with blazing speed.'
    },
    {
        icon: Sparkles,
        title: 'AI-Powered',
        description: 'Background removal, upscaling, and detection using advanced AI.'
    },
    {
        icon: Download,
        title: 'Direct Download',
        description: 'Download videos from YouTube, Instagram, and more.'
    },
    {
        icon: Scissors,
        title: 'Precise Editing',
        description: 'Crop, trim, and edit with pixel-perfect precision.'
    },
]

export default function HomePage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden">
                {/* Background Glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--glow-blue)] rounded-full blur-[120px] opacity-30" />
                </div>

                <div className="relative max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 category-badge mb-6">
                            <Wand2 className="w-4 h-4" />
                            <span>All-in-One Tool Suite</span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6">
                            <span className="text-gradient">Mage</span>
                            <span className="glow-text">tool</span>
                        </h1>

                        <p className="text-xl lg:text-2xl text-[var(--text-secondary)] max-w-3xl mx-auto mb-10">
                            The ultimate file manipulation hub. Convert, edit, and transform
                            <span className="text-[var(--premium-blue-400)]"> images, videos, audio, and documents</span> with
                            powerful AI-powered features.
                        </p>

                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link href="/images" className="glass-button-primary glass-button text-lg px-8 py-4">
                                Get Started
                            </Link>
                            <Link href="#tools" className="glass-button text-lg px-8 py-4">
                                Explore Tools
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap justify-center gap-12 mt-16">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-[var(--premium-blue-400)]">40+</div>
                                <div className="text-[var(--text-muted)]">Tools Available</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-[var(--premium-blue-400)]">40</div>
                                <div className="text-[var(--text-muted)]">Files at Once</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-[var(--premium-blue-400)]">100%</div>
                                <div className="text-[var(--text-muted)]">Free to Use</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="glass-card p-6"
                            >
                                <div className="tool-card-icon w-12 h-12 mb-4">
                                    <feature.icon className="w-6 h-6 text-[var(--premium-blue-400)]" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                <p className="text-[var(--text-muted)] text-sm">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tool Categories */}
            <section id="tools" className="py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="section-title mb-4">Choose Your Tool</h2>
                        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
                            Select a category to explore powerful tools for your media needs.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {categories.map((category, index) => (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <Link href={category.href}>
                                    <div className="tool-card group h-full">
                                        <div className="flex items-start gap-4">
                                            <div className={`tool-card-icon bg-gradient-to-br ${category.gradient} !bg-opacity-20`}>
                                                <category.icon className="w-7 h-7 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold mb-2 group-hover:text-[var(--premium-blue-400)] transition-colors">
                                                    {category.title}
                                                </h3>
                                                <p className="text-[var(--text-muted)] text-sm mb-4">
                                                    {category.description}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {category.tools.map((tool) => (
                                                        <span
                                                            key={tool}
                                                            className="px-3 py-1 text-xs rounded-full bg-[var(--glass-white)] border border-[var(--glass-border)] text-[var(--text-secondary)]"
                                                        >
                                                            {tool}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 lg:py-24">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass-panel p-12 text-center relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-blue-glow opacity-20" />
                        <div className="relative">
                            <FileSearch className="w-16 h-16 mx-auto mb-6 text-[var(--premium-blue-400)]" />
                            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                                Ready to Transform Your Files?
                            </h2>
                            <p className="text-[var(--text-secondary)] text-lg mb-8 max-w-xl mx-auto">
                                Start using Magetool today. No signup required. Just drag, drop, and go!
                            </p>
                            <Link href="/images" className="glass-button-primary glass-button text-lg px-8 py-4 inline-flex items-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                Start Now - It&apos;s Free
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
