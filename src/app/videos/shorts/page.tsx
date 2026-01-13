'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Film, ArrowLeft, Download, Loader2, Link2, Zap, Clock, HardDrive } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import { videoApi, downloadFile, DownloadProgress, DownloadComplete } from '@/lib/api'

export default function ShortsDownloaderPage() {
    const [url, setUrl] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [progress, setProgress] = useState<DownloadProgress | null>(null)
    const [result, setResult] = useState<{ filename: string; title: string; duration: number; size: number } | null>(null)
    const eventSourceRef = useRef<EventSource | null>(null)

    const handleDownload = async () => {
        if (!url.trim()) {
            toast.error('Please enter a YouTube Shorts URL')
            return
        }
        setIsProcessing(true)
        setResult(null)
        setProgress({ status: 'starting', message: 'Connecting...' })

        if (eventSourceRef.current) {
            eventSourceRef.current.close()
        }

        eventSourceRef.current = videoApi.downloadShortsWithProgress(
            url,
            (data: DownloadProgress) => setProgress(data),
            (data: DownloadComplete) => {
                setResult({
                    filename: data.filename,
                    title: data.title,
                    duration: data.duration || 0,
                    size: data.size
                })
                setProgress(null)
                setIsProcessing(false)
                toast.success('Shorts downloaded!')
            },
            (error: string) => {
                setProgress(null)
                setIsProcessing(false)
                toast.error(error)
            }
        )
    }

    const getProgressPercent = (): number => {
        if (!progress) return 0
        if (progress.percent_num) return Math.min(progress.percent_num, 100)
        if (progress.percent) {
            const num = parseFloat(progress.percent.replace('%', ''))
            return isNaN(num) ? 0 : Math.min(num, 100)
        }
        return 0
    }

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <Link href="/videos" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Video Tools
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="tool-card-icon w-14 h-14 !bg-gradient-to-br from-red-500/20 to-pink-500/10 !border-red-500/30">
                            <Film className="w-7 h-7 text-red-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Shorts Downloader</h1>
                            <p className="text-[var(--text-muted)]">Download YouTube Shorts videos</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Enter Shorts URL</h2>
                        <div className="relative">
                            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://youtube.com/shorts/..."
                                className="glass-input pl-12"
                                disabled={isProcessing}
                            />
                        </div>
                    </div>

                    {/* Progress Section */}
                    {progress && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                                <span className="font-medium">
                                    {progress.status === 'starting' && 'Fetching video info...'}
                                    {progress.status === 'downloading' && 'Downloading...'}
                                    {progress.status === 'processing' && (progress.message || 'Processing...')}
                                </span>
                            </div>

                            {progress.status === 'downloading' && (
                                <>
                                    <div className="relative h-4 bg-[var(--glass-white)] rounded-full overflow-hidden mb-4">
                                        <motion.div
                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${getProgressPercent()}%` }}
                                            transition={{ duration: 0.3 }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xs font-bold text-white drop-shadow-lg">
                                                {getProgressPercent().toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                            <Zap className="w-4 h-4 text-yellow-500" />
                                            <span>Speed: {progress.speed || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                            <Clock className="w-4 h-4 text-blue-500" />
                                            <span>ETA: {progress.eta || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                            <HardDrive className="w-4 h-4 text-green-500" />
                                            <span>{progress.downloaded || '0B'}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}

                    {!progress && !result && (
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full !bg-gradient-to-r !from-red-500 !to-pink-600"
                            onClick={handleDownload}
                            loading={isProcessing}
                            disabled={!url.trim()}
                        >
                            {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Downloading...</> : <><Film className="w-5 h-5" /> Download Shorts</>}
                        </Button>
                    )}

                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
                            <h2 className="text-lg font-semibold mb-4">Download Ready!</h2>
                            <div className="p-4 rounded-xl bg-[var(--glass-white)] border border-[var(--glass-border)] mb-4">
                                <p className="font-medium line-clamp-2">{result.title}</p>
                                <div className="flex gap-4 text-sm text-[var(--text-muted)] mt-2">
                                    {result.duration > 0 && <span>{Math.floor(result.duration / 60)}:{(result.duration % 60).toString().padStart(2, '0')}</span>}
                                    {result.size > 0 && <span>{(result.size / (1024 * 1024)).toFixed(1)} MB</span>}
                                </div>
                            </div>
                            <Button className="w-full" onClick={() => downloadFile(result.filename, 'youtube_shorts.mp4')}>
                                <Download className="w-4 h-4" /> Save Video
                            </Button>
                            <Button variant="ghost" className="mt-4 w-full" onClick={() => { setUrl(''); setResult(null); }}>Download Another</Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
