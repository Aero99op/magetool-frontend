'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ArrowLeft, Music2, User, Disc } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import FileDropzone from '@/components/ui/FileDropzone'
import Button from '@/components/ui/Button'
import { useFileStore } from '@/lib/store'
import { audioApi } from '@/lib/api'

export default function AudioFinderPage() {
    const { files, clearFiles } = useFileStore()
    const [isProcessing, setIsProcessing] = useState(false)
    const [results, setResults] = useState<Array<{ original: string; metadata: Record<string, string> }>>([])

    const handleIdentify = async () => {
        if (files.length === 0) {
            toast.error('Please add at least one audio file')
            return
        }
        setIsProcessing(true)
        setResults([])
        try {
            const response = await audioApi.identify(files.map((f) => f.file))
            if (response.data.success) {
                setResults(response.data.results)
                toast.success('Metadata extracted!')
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Identification failed')
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
                            <Search className="w-7 h-7 text-green-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Audio Name Finder</h1>
                            <p className="text-[var(--text-muted)]">Identify song info and metadata</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Upload Audio Files</h2>
                        <FileDropzone accept={{ 'audio/*': ['.mp3', '.wav', '.flac', '.m4a', '.ogg'] }} hint="We'll extract embedded metadata" />
                    </div>

                    <Button variant="primary" size="lg" className="w-full !bg-gradient-to-r !from-green-500 !to-emerald-600" onClick={handleIdentify} loading={isProcessing} disabled={files.length === 0}>
                        <Search className="w-5 h-5" /> Identify Audio
                    </Button>

                    {results.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                            {results.map((result, i) => (
                                <div key={i} className="glass-panel p-6">
                                    <h3 className="font-semibold mb-4">{result.original}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--glass-white)]">
                                            <Music2 className="w-5 h-5 text-[var(--premium-blue-400)]" />
                                            <div>
                                                <p className="text-xs text-[var(--text-muted)]">Title</p>
                                                <p className="font-medium">{result.metadata.title || 'Unknown'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--glass-white)]">
                                            <User className="w-5 h-5 text-[var(--premium-blue-400)]" />
                                            <div>
                                                <p className="text-xs text-[var(--text-muted)]">Artist</p>
                                                <p className="font-medium">{result.metadata.artist || 'Unknown'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--glass-white)]">
                                            <Disc className="w-5 h-5 text-[var(--premium-blue-400)]" />
                                            <div>
                                                <p className="text-xs text-[var(--text-muted)]">Album</p>
                                                <p className="font-medium">{result.metadata.album || 'Unknown'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--glass-white)]">
                                            <Search className="w-5 h-5 text-[var(--premium-blue-400)]" />
                                            <div>
                                                <p className="text-xs text-[var(--text-muted)]">Duration</p>
                                                <p className="font-medium">{result.metadata.duration || 'Unknown'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full" onClick={() => { clearFiles(); setResults([]); }}>Identify More</Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
