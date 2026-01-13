'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Scissors, ArrowLeft, Download, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import { audioApi, downloadFile } from '@/lib/api'

export default function AudioTrimmerPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [startTime, setStartTime] = useState(0)
    const [endTime, setEndTime] = useState(30)
    const [isProcessing, setIsProcessing] = useState(false)
    const [result, setResult] = useState<{ filename: string } | null>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            setResult(null)
        }
    }

    const handleTrim = async () => {
        if (!selectedFile) return
        setIsProcessing(true)
        try {
            const response = await audioApi.trim(selectedFile, startTime, endTime)
            if (response.data.success) {
                setResult(response.data.file)
                toast.success('Audio trimmed!')
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Trim failed')
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
                            <Scissors className="w-7 h-7 text-green-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Audio Trimmer</h1>
                            <p className="text-[var(--text-muted)]">Trim and cut audio files with precision</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Select Audio File</h2>
                        <input type="file" accept="audio/*" onChange={handleFileSelect} className="glass-input" />
                        {selectedFile && <p className="mt-2 text-sm text-[var(--text-muted)]">Selected: {selectedFile.name}</p>}
                    </div>

                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Trim Settings</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-[var(--text-muted)]">Start Time (seconds)</label>
                                <input type="number" min="0" value={startTime} onChange={(e) => setStartTime(+e.target.value)} className="glass-input mt-1" />
                            </div>
                            <div>
                                <label className="text-sm text-[var(--text-muted)]">End Time (seconds)</label>
                                <input type="number" min="0" value={endTime} onChange={(e) => setEndTime(+e.target.value)} className="glass-input mt-1" />
                            </div>
                        </div>
                        <p className="mt-2 text-sm text-[var(--text-muted)]">Duration: {endTime - startTime} seconds</p>
                    </div>

                    <Button variant="primary" size="lg" className="w-full !bg-gradient-to-r !from-green-500 !to-emerald-600" onClick={handleTrim} loading={isProcessing} disabled={!selectedFile}>
                        <Scissors className="w-5 h-5" /> Trim Audio
                    </Button>

                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Check className="w-5 h-5 text-green-400" />
                                <h2 className="text-lg font-semibold">Trim Complete!</h2>
                            </div>
                            <Button className="w-full" onClick={() => downloadFile(result.filename, 'trimmed_audio.mp3')}>
                                <Download className="w-4 h-4" /> Download Trimmed Audio
                            </Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
