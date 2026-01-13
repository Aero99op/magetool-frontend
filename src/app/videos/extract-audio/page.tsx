'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Music, ArrowLeft, Download, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import FileDropzone from '@/components/ui/FileDropzone'
import Button from '@/components/ui/Button'
import { useFileStore } from '@/lib/store'
import { videoApi, downloadFile } from '@/lib/api'

export default function ExtractAudioPage() {
    const { files, clearFiles } = useFileStore()
    const [isProcessing, setIsProcessing] = useState(false)
    const [results, setResults] = useState<Array<{ filename: string; original: string }>>([])

    const handleExtract = async () => {
        if (files.length === 0) {
            toast.error('Please add at least one video')
            return
        }
        setIsProcessing(true)
        setResults([])
        try {
            const response = await videoApi.extractAudio(files.map((f) => f.file))
            if (response.data.success) {
                setResults(response.data.files)
                toast.success('Audio extracted!')
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Extraction failed')
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
                        <div className="tool-card-icon w-14 h-14 !bg-gradient-to-br from-green-500/20 to-emerald-500/10 !border-green-500/30">
                            <Music className="w-7 h-7 text-green-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Extract Audio</h1>
                            <p className="text-[var(--text-muted)]">Extract audio track from videos</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Upload Videos</h2>
                        <FileDropzone accept={{ 'video/*': ['.mp4', '.avi', '.mkv', '.mov', '.webm'] }} hint="Audio will be extracted as MP3" />
                    </div>

                    <Button variant="primary" size="lg" className="w-full !bg-gradient-to-r !from-green-500 !to-emerald-600" onClick={handleExtract} loading={isProcessing} disabled={files.length === 0}>
                        <Music className="w-5 h-5" /> Extract Audio
                    </Button>

                    {results.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Check className="w-5 h-5 text-green-400" />
                                <h2 className="text-lg font-semibold">Audio Extracted!</h2>
                            </div>
                            <div className="space-y-3">
                                {results.map((result, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[var(--glass-white)] border border-[var(--glass-border)]">
                                        <span className="text-sm truncate">{result.original}</span>
                                        <Button size="sm" onClick={() => downloadFile(result.filename, result.original.replace(/\.[^/.]+$/, '.mp3'))}>
                                            <Download className="w-4 h-4" /> Download MP3
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button variant="ghost" className="mt-4 w-full" onClick={() => { clearFiles(); setResults([]); }}>Extract More</Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
