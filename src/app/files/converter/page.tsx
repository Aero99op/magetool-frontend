'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, ArrowLeft, Download, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Accept } from 'react-dropzone'
import FileDropzone from '@/components/ui/FileDropzone'
import Button from '@/components/ui/Button'
import ProgressTracker, { ProgressStage } from '@/components/ui/ProgressTracker'
import { useFileStore } from '@/lib/store'
import { fileApi, downloadFile } from '@/lib/api'

// Expanded conversion options
const conversions = [
    // PDF conversions
    { from: 'PDF', to: 'PNG', value: 'pdf-to-png', sourceType: 'pdf', targetFormat: 'png' },
    { from: 'PDF', to: 'JPG', value: 'pdf-to-jpg', sourceType: 'pdf', targetFormat: 'jpg' },
    // Image to PDF
    { from: 'PNG', to: 'PDF', value: 'png-to-pdf', sourceType: 'png', targetFormat: 'pdf' },
    { from: 'JPG', to: 'PDF', value: 'jpg-to-pdf', sourceType: 'jpg', targetFormat: 'pdf' },
    // Document conversions
    { from: 'DOCX', to: 'TXT', value: 'docx-to-txt', sourceType: 'docx', targetFormat: 'txt' },
    { from: 'DOCX', to: 'PDF', value: 'docx-to-pdf', sourceType: 'docx', targetFormat: 'pdf' },
    { from: 'TXT', to: 'DOCX', value: 'txt-to-docx', sourceType: 'txt', targetFormat: 'docx' },
]

interface ConversionResult {
    filename: string
    original: string
}

export default function FileConverterPage() {
    const { files, clearFiles } = useFileStore()
    const [conversion, setConversion] = useState('pdf-to-png')
    const [isProcessing, setIsProcessing] = useState(false)
    const [results, setResults] = useState<ConversionResult[]>([])
    const [progressStage, setProgressStage] = useState<ProgressStage>('idle')
    const [progressPercent, setProgressPercent] = useState(0)
    const [progressMessage, setProgressMessage] = useState('')

    const selectedConversion = conversions.find(c => c.value === conversion)!

    const handleConvert = async () => {
        if (files.length === 0) {
            toast.error('Please add at least one file')
            return
        }

        setIsProcessing(true)
        setResults([])
        setProgressStage('uploading')
        setProgressPercent(0)
        setProgressMessage(`Uploading ${files.length} file(s)...`)

        try {
            const response = await fileApi.convert(
                files.map((f) => f.file),
                selectedConversion.targetFormat,
                (progress) => {
                    setProgressPercent(progress)
                    if (progress >= 100) {
                        setProgressStage('processing')
                        setProgressPercent(0)
                        setProgressMessage(`Converting to ${selectedConversion.to}...`)
                    }
                }
            )

            console.log('API Response:', response.data) // Debug log

            if (response.data.success) {
                // Normalize response - backend returns different formats
                const normalizedResults: ConversionResult[] = []

                if (response.data.files && Array.isArray(response.data.files)) {
                    response.data.files.forEach((item: Record<string, unknown>) => {
                        // Check if this is a PDF-to-images result (has nested files array)
                        if (item.files && Array.isArray(item.files)) {
                            // PDF to images - each page becomes a separate file
                            (item.files as Array<{ filename: string; page?: number; size?: number }>).forEach((pageFile) => {
                                normalizedResults.push({
                                    filename: pageFile.filename,
                                    original: `${item.original || 'PDF'} - Page ${pageFile.page || normalizedResults.length + 1}`
                                })
                            })
                        } else if (item.filename) {
                            // Regular single-file conversion
                            normalizedResults.push({
                                filename: item.filename as string,
                                original: (item.original as string) || (item.filename as string)
                            })
                        } else if (item.error) {
                            // Handle conversion errors
                            toast.error(`Error: ${item.error}`)
                        }
                    })
                } else if (response.data.file) {
                    // Single file result
                    const file = response.data.file
                    normalizedResults.push({
                        filename: typeof file === 'string' ? file : file.filename,
                        original: file.original || file.filename || 'Converted file'
                    })
                }

                console.log('Normalized results:', normalizedResults) // Debug log

                if (normalizedResults.length > 0) {
                    setResults(normalizedResults)
                    setProgressStage('completed')
                    setProgressMessage(`${normalizedResults.length} file(s) ready for download`)
                    toast.success('Conversion complete!')
                } else {
                    setProgressStage('error')
                    setProgressMessage('No files were converted')
                    toast.error('Conversion produced no output')
                }
            } else {
                throw new Error('Conversion failed')
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Conversion failed'
            toast.error(errorMessage)
            setProgressStage('error')
            setProgressMessage(errorMessage)
        } finally {
            setIsProcessing(false)
        }
    }

    const getAcceptTypes = (): Accept => {
        switch (selectedConversion.sourceType) {
            case 'pdf':
                return { 'application/pdf': ['.pdf'] }
            case 'docx':
                return { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }
            case 'txt':
                return { 'text/plain': ['.txt'] }
            case 'png':
                return { 'image/png': ['.png'] }
            case 'jpg':
                return { 'image/jpeg': ['.jpg', '.jpeg'] }
            default:
                return {}
        }
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
                                <button
                                    key={c.value}
                                    onClick={() => { setConversion(c.value); clearFiles(); setResults([]); setProgressStage('idle'); }}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all ${conversion === c.value ? 'bg-orange-500 text-white' : 'bg-[var(--glass-white)] border border-[var(--glass-border)]'}`}
                                >
                                    {c.from} → {c.to}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Upload {selectedConversion.from} Files</h2>
                        <FileDropzone accept={getAcceptTypes()} hint={`Upload ${selectedConversion.from} files to convert to ${selectedConversion.to}`} />
                    </div>

                    <Button variant="primary" size="lg" className="w-full !bg-gradient-to-r !from-orange-500 !to-amber-600" onClick={handleConvert} loading={isProcessing} disabled={files.length === 0}>
                        <RefreshCw className="w-5 h-5" /> Convert to {selectedConversion.to}
                    </Button>

                    <ProgressTracker
                        stage={progressStage}
                        percent={progressPercent}
                        message={progressMessage}
                    />

                    {results.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Check className="w-5 h-5 text-green-400" />
                                <h2 className="text-lg font-semibold">Conversion Complete ({results.length} files)</h2>
                            </div>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                {results.map((result, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[var(--glass-white)] border border-[var(--glass-border)]">
                                        <span className="text-sm truncate flex-1 mr-4">{result.original}</span>
                                        <Button size="sm" onClick={() => downloadFile(result.filename, result.filename)}>
                                            <Download className="w-4 h-4" /> Download
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button variant="ghost" className="mt-4 w-full" onClick={() => { clearFiles(); setResults([]); setProgressStage('idle'); }}>Convert More</Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
