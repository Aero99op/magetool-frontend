'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Youtube, ArrowLeft, Download, Loader2, Link2, Zap, Clock, HardDrive } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import { videoApi, downloadFile, DownloadProgress, DownloadComplete } from '@/lib/api'

export default function YouTubeDownloaderPage() {
    const [url, setUrl] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [progress, setProgress] = useState<DownloadProgress | null>(null)
    const [result, setResult] = useState<{
        filename: string
        title: string
        duration: number
        size: number
    } | null>(null)
    const eventSourceRef = useRef<EventSource | null>(null)

    const handleDownload = async () => {
        if (!url.trim()) {
            toast.error('Please enter a YouTube URL')
            return
        }

        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            toast.error('Please enter a valid YouTube URL')
            return
        }

        setIsProcessing(true)
        setResult(null)
        setProgress({ status: 'starting', message: 'Connecting to YouTube...' })

        // Close any existing connection
        if (eventSourceRef.current) {
            eventSourceRef.current.close()
        }

        eventSourceRef.current = videoApi.downloadYoutubeWithProgress(
            url,
            // onProgress
            (data: DownloadProgress) => {
                setProgress(data)
            },
            // onComplete
            (data: DownloadComplete) => {
                setResult({
                    filename: data.filename,
                    title: data.title,
                    duration: data.duration || 0,
                    size: data.size
                })
                setProgress(null)
                setIsProcessing(false)
                toast.success('Video downloaded successfully!')
            },
            // onError
            (error: string) => {
                setProgress(null)
                setIsProcessing(false)
                toast.error(error)
            }
        )
    }

    const handleFileDownload = async () => {
        if (result) {
            const safeName = result.title.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 50) + '.mp4'
            await downloadFile(result.filename, safeName)
            toast.success('Saved to downloads!')
        }
    }

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const formatSize = (bytes: number) => {
        const mb = bytes / (1024 * 1024)
        return `${mb.toFixed(1)} MB`
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
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Link href="/videos" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Video Tools
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="tool-card-icon w-14 h-14 !bg-gradient-to-br from-red-500/20 to-red-700/10 !border-red-500/30">
                            <Youtube className="w-7 h-7 text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">YouTube Downloader</h1>
                            <p className="text-[var(--text-muted)]">
                                Download videos from YouTube in best quality
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                >
                    {/* URL Input */}
                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Enter YouTube URL</h2>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="glass-input pl-12"
                                    disabled={isProcessing}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-2">
                            Supports regular videos, Shorts, and playlists
                        </p>
                    </div>

                    {/* Progress Section */}
                    {progress && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-panel p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                                <span className="font-medium">
                                    {progress.status === 'starting' && 'Fetching video info...'}
                                    {progress.status === 'downloading' && 'Downloading...'}
                                    {progress.status === 'processing' && (progress.message || 'Processing...')}
                                </span>
                            </div>

                            {/* Progress Bar */}
                            {progress.status === 'downloading' && (
                                <>
                                    <div className="relative h-4 bg-[var(--glass-white)] rounded-full overflow-hidden mb-4">
                                        <motion.div
                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-red-600 rounded-full"
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

                                    {/* Download Stats */}
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
                                            <span>{progress.downloaded || '0B'} / {progress.total || '?'}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}

                    {/* Download Button */}
                    {!progress && !result && (
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full !bg-gradient-to-r !from-red-500 !to-red-700 hover:!from-red-400 hover:!to-red-600"
                            onClick={handleDownload}
                            loading={isProcessing}
                            disabled={!url.trim()}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Downloading Video...
                                </>
                            ) : (
                                <>
                                    <Youtube className="w-5 h-5" />
                                    Download Video
                                </>
                            )}
                        </Button>
                    )}

                    {/* Result */}
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-panel p-6"
                        >
                            <h2 className="text-lg font-semibold mb-4">Download Ready!</h2>

                            <div className="p-4 rounded-xl bg-[var(--glass-white)] border border-[var(--glass-border)]">
                                <h3 className="font-medium mb-2 line-clamp-2">{result.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] mb-4">
                                    {result.duration > 0 && (
                                        <span>Duration: {formatDuration(result.duration)}</span>
                                    )}
                                    {result.size > 0 && (
                                        <span>Size: {formatSize(result.size)}</span>
                                    )}
                                </div>
                                <Button onClick={handleFileDownload} className="w-full">
                                    <Download className="w-4 h-4" />
                                    Save Video
                                </Button>
                            </div>

                            <Button
                                variant="ghost"
                                className="mt-4 w-full"
                                onClick={() => {
                                    setUrl('')
                                    setResult(null)
                                }}
                            >
                                Download Another Video
                            </Button>
                        </motion.div>
                    )}

                    {/* Info */}
                    <div className="glass-card p-4 border-[var(--premium-blue-500)]/30">
                        <p className="text-sm text-[var(--text-secondary)]">
                            💡 <strong>Note:</strong> Downloads use yt-dlp for reliable video fetching. Please respect copyright and only download videos you have permission to use.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
