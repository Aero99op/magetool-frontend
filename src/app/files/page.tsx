'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    FileText,
    RefreshCw,
    ScanText,
    Edit,
    Combine,
    Split
} from 'lucide-react'

const tools = [
    {
        id: 'converter',
        title: 'File Converter',
        description: 'Convert files between different formats (PDF, DOCX, TXT, images)',
        icon: RefreshCw,
        href: '/files/converter',
    },
    {
        id: 'ocr',
        title: 'OCR Scanner',
        description: 'Extract text from scanned documents and PDFs',
        icon: ScanText,
        href: '/files/ocr',
    },
    {
        id: 'editor',
        title: 'File Editor',
        description: 'Edit text content in documents',
        icon: Edit,
        href: '/files/editor',
    },
    {
        id: 'merge-pdf',
        title: 'Merge PDFs',
        description: 'Combine multiple PDF files into one document',
        icon: Combine,
        href: '/files/merge-pdf',
    },
    {
        id: 'split-pdf',
        title: 'Split PDF',
        description: 'Split a PDF file into separate pages or sections',
        icon: Split,
        href: '/files/split-pdf',
    },
]

export default function FilesPage() {
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
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                            <FileText className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="section-title text-3xl lg:text-4xl">File Tools</h1>
                            <p className="text-[var(--text-muted)]">
                                Convert, edit, and manage your documents
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
