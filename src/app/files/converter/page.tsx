'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, ArrowLeft, Download, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Accept } from 'react-dropzone'
import FileDropzone from '@/components/ui/FileDropzone'
import Button from '@/components/ui/Button'
import { useFileStore } from '@/lib/store'
import { fileApi, downloadFile } from '@/lib/api'

const conversions = [
    { from: 'PDF', to: 'Images', value: 'pdf-to-images' },
    { from: 'DOCX', to: 'TXT', value: 'docx-to-txt' },
    { from: 'DOCX', to: 'PDF', value: 'docx-to-pdf' },
]

export default function FileConverterPage() {
    const { files, clearFiles } = useFileStore()
    const [conversion, setConversion] = useState('pdf-to-images')
    const [isProcessing, setIsProcessing] = useState(false)
    const [results, setResults] = useState<Array<{ filename: string; original: string }>>([])

    const handleConvert = async () => {
        if (files.length === 0) {
            toast.error('Please add at least one file')
            return
        }
        setIsProcessing(true)
        setResults([])
        try {
            const response = await fileApi.convert(files.map((f) => f.file), conversion)
            if (response.data.success) {
                // Normalize response - backend returns different formats for different conversions
                let normalizedResults: Array<{ filename: string; original: string }> = []

                // Check if response has files array (PDF to images or batch results)
                if (response.data.files && Array.isArray(response.data.files)) {
                    // Handle per-file response (batch convert)
                    response.data.files.forEach((item: { filename?: string; files?: Array<{ filename: string }>; original?: string }) => {
                        if (item.filename) {
                            // Single file result
                            normalizedResults.push({
                                filename: item.filename,
                                original: item.original || item.filename
                            })
                        } else if (item.files && Array.isArray(item.files)) {
                            // PDF to images - multiple files per input
                            item.files.forEach((f: { filename: string; page?: number }) => {
                                normalizedResults.push({
                                    filename: f.filename,
                                    original: `Page ${f.page || 1}`
                                })
                            })
                        }
                    })
                } else if (response.data.file) {
                    // Single file result
                    normalizedResults.push({
                        filename: response.data.file.filename || response.data.file,
                        original: response.data.file.original || response.data.file.filename || 'Converted file'
                    })
                }

                setResults(normalizedResults)
                toast.success('Conversion complete!')
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Conversion failed')
        } finally {
            setIsProcessing(false)
        }
    }

    const getAcceptTypes = (): Accept => {
        if (conversion.startsWith('pdf')) return { 'application/pdf': ['.pdf'] }
        if (conversion.startsWith('docx')) return { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }
        return {}
    }

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <Link href="/files" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to File Tools
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="tool-card-icon w-14 h-14 !bg-gradient-to-br from-orange-500/20 to-amber-500/10 !border-orange-500/30">
                            <RefreshCw className="w-7 h-7 text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">File Converter</h1>
                            <p className="text-[var(--text-muted)]">Convert between file formats</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Conversion Type</h2>
                        <div className="flex flex-wrap gap-3">
                            {conversions.map((c) => (
                                <button key={c.value} onClick={() => { setConversion(c.value); clearFiles(); }} className={`px-4 py-2 rounded-xl font-medium transition-all ${conversion === c.value ? 'bg-orange-500 text-white' : 'bg-[var(--glass-white)] border border-[var(--glass-border)]'}`}>
                                    {c.from} → {c.to}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Upload Files</h2>
                        <FileDropzone accept={getAcceptTypes()} hint={`Upload ${conversion.split('-')[0].toUpperCase()} files`} />
                    </div>

                    <Button variant="primary" size="lg" className="w-full !bg-gradient-to-r !from-orange-500 !to-amber-600" onClick={handleConvert} loading={isProcessing} disabled={files.length === 0}>
                        <RefreshCw className="w-5 h-5" /> Convert Files
                    </Button>

                    {results.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Check className="w-5 h-5 text-green-400" />
                                <h2 className="text-lg font-semibold">Conversion Complete</h2>
                            </div>
                            <div className="space-y-3">
                                {results.map((result, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[var(--glass-white)] border border-[var(--glass-border)]">
                                        <span className="text-sm truncate">{result.original || result.filename}</span>
                                        <Button size="sm" onClick={() => downloadFile(result.filename, result.filename)}>
                                            <Download className="w-4 h-4" /> Download
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button variant="ghost" className="mt-4 w-full" onClick={() => { clearFiles(); setResults([]); }}>Convert More</Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
