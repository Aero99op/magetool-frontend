'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, ArrowLeft, Download, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import FileDropzone from '@/components/ui/FileDropzone'
import Button from '@/components/ui/Button'
import ProgressTracker, { ProgressStage } from '@/components/ui/ProgressTracker'
import { useFileStore } from '@/lib/store'
import { videoApi, downloadFile } from '@/lib/api'

const formats = ['MP4', 'AVI', 'MKV', 'MOV', 'WebM', 'FLV', 'WMV']

export default function VideoConverterPage() {
    const { files, clearFiles } = useFileStore()
    const [targetFormat, setTargetFormat] = useState('MP4')
    const [isProcessing, setIsProcessing] = useState(false)
    const [results, setResults] = useState<Array<{ filename: string; original: string }>>([])
    const [progressStage, setProgressStage] = useState<ProgressStage>('idle')
    const [progressPercent, setProgressPercent] = useState(0)
    const [progressMessage, setProgressMessage] = useState('')

    const handleConvert = async () => {
        if (files.length === 0) {
            toast.error('Please add at least one video')
            return
        }
        setIsProcessing(true)
        setResults([])
        setProgressStage('uploading')
        setProgressPercent(0)
        setProgressMessage(`Uploading ${files.length} video(s)...`)

        try {
            const response = await videoApi.convert(
                files.map((f) => f.file),
                targetFormat.toLowerCase(),
                (progress) => {
                    setProgressPercent(progress)
                    if (progress >= 100) {
                        setProgressStage('processing')
                        setProgressPercent(0)
                        setProgressMessage(`Converting to ${targetFormat}... (this may take a while)`)
                    }
                }
            )
            if (response.data.success) {
                setResults(response.data.files)
                setProgressStage('completed')
                setProgressMessage(`${response.data.files.length} video(s) ready!`)
                toast.success(`Converted to ${targetFormat}!`)
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

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <Link href="/videos" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Video Tools
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="tool-card-icon w-14 h-14 !bg-gradient-to-br from-purple-500/20 to-pink-500/10 !border-purple-500/30">
                            <RefreshCw className="w-7 h-7 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Video Converter</h1>
                            <p className="text-[var(--text-muted)]">Convert videos between formats</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Upload Videos</h2>
                        <FileDropzone accept={{ 'video/*': ['.mp4', '.avi', '.mkv', '.mov', '.webm'] }} hint="Supports MP4, AVI, MKV, MOV, WebM" />
                    </div>

                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Target Format</h2>
                        <div className="flex flex-wrap gap-3">
                            {formats.map((f) => (
                                <button key={f} onClick={() => setTargetFormat(f)} className={`px-4 py-2 rounded-xl font-medium transition-all ${targetFormat === f ? 'bg-purple-500 text-white' : 'bg-[var(--glass-white)] border border-[var(--glass-border)]'}`}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button variant="primary" size="lg" className="w-full !bg-gradient-to-r !from-purple-500 !to-pink-600" onClick={handleConvert} loading={isProcessing} disabled={files.length === 0}>
                        <RefreshCw className="w-5 h-5" /> Convert to {targetFormat}
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
                                <h2 className="text-lg font-semibold">Conversion Complete</h2>
                            </div>
                            <div className="space-y-3">
                                {results.map((result, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[var(--glass-white)] border border-[var(--glass-border)]">
                                        <span className="text-sm truncate">{result.original}</span>
                                        <Button size="sm" onClick={() => downloadFile(result.filename, result.original.replace(/\.[^/.]+$/, `.${targetFormat.toLowerCase()}`))}>
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

