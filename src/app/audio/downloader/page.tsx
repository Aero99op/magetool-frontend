'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, ArrowLeft, Loader2, Link2, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import { audioApi, downloadFile } from '@/lib/api'

export default function AudioDownloaderPage() {
    const [url, setUrl] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [result, setResult] = useState<{ filename: string; title: string } | null>(null)

    const handleDownload = async () => {
        if (!url.trim()) {
            toast.error('Please enter a URL')
            return
        }
        setIsProcessing(true)
        setResult(null)
        try {
            const response = await audioApi.download(url)
            if (response.data.success && !response.data.file?.error) {
                setResult(response.data.file)
                toast.success('Audio downloaded!')
            } else {
                toast.error(response.data.file?.error || 'Download failed')
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Download failed')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <Link href="/audio" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Audio Tools
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="tool-card-icon w-14 h-14 !bg-gradient-to-br from-green-500/20 to-emerald-500/10 !border-green-500/30">
                            <Download className="w-7 h-7 text-green-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Audio Downloader</h1>
                            <p className="text-[var(--text-muted)]">Download audio from YouTube and other sources</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Enter URL</h2>
                        <div className="relative">
                            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="glass-input pl-12" />
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-2">Supports YouTube, SoundCloud, and other platforms</p>
                    </div>

                    <Button variant="primary" size="lg" className="w-full !bg-gradient-to-r !from-green-500 !to-emerald-600" onClick={handleDownload} loading={isProcessing} disabled={!url.trim()}>
                        {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Downloading...</> : <><Download className="w-5 h-5" /> Download Audio</>}
                    </Button>

                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Check className="w-5 h-5 text-green-400" />
                                <h2 className="text-lg font-semibold">Download Ready!</h2>
                            </div>
                            <div className="p-4 rounded-xl bg-[var(--glass-white)] border border-[var(--glass-border)] mb-4">
                                <p className="font-medium line-clamp-2">{result.title}</p>
                            </div>
                            <Button className="w-full" onClick={() => downloadFile(result.filename, `${result.title.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 50)}.mp3`)}>
                                <Download className="w-4 h-4" /> Save MP3
                            </Button>
                            <Button variant="ghost" className="mt-4 w-full" onClick={() => { setUrl(''); setResult(null); }}>Download Another</Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
