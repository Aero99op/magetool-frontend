'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Move, ArrowLeft, Download, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import FileDropzone from '@/components/ui/FileDropzone'
import Button from '@/components/ui/Button'
import { useFileStore } from '@/lib/store'
import { imageApi, downloadFile } from '@/lib/api'

export default function ImageResizerPage() {
    const { files, clearFiles } = useFileStore()
    const [width, setWidth] = useState(800)
    const [height, setHeight] = useState(600)
    const [isProcessing, setIsProcessing] = useState(false)
    const [results, setResults] = useState<Array<{ filename: string; original: string }>>([])

    const handleResize = async () => {
        if (files.length === 0) {
            toast.error('Please add at least one image')
            return
        }
        setIsProcessing(true)
        setResults([])
        try {
            const response = await imageApi.resize(files.map((f) => f.file), width, height)
            if (response.data.success) {
                setResults(response.data.files)
                toast.success(`Resized ${response.data.files.length} image(s) to ${width}x${height}`)
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Resize failed')
        } finally {
            setIsProcessing(false)
        }
    }

    const presets = [
        { name: 'HD', w: 1280, h: 720 },
        { name: 'Full HD', w: 1920, h: 1080 },
        { name: '4K', w: 3840, h: 2160 },
        { name: 'Instagram', w: 1080, h: 1080 },
        { name: 'Twitter', w: 1200, h: 675 },
    ]

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <Link href="/images" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Image Tools
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="tool-card-icon w-14 h-14">
                            <Move className="w-7 h-7 text-[var(--premium-blue-400)]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Image Resizer</h1>
                            <p className="text-[var(--text-muted)]">Resize images to custom dimensions</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Upload Images</h2>
                        <FileDropzone accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }} />
                    </div>

                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Dimensions</h2>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {presets.map((p) => (
                                <button key={p.name} onClick={() => { setWidth(p.w); setHeight(p.h); }} className="px-3 py-1.5 text-sm rounded-lg bg-[var(--glass-white)] border border-[var(--glass-border)] hover:border-[var(--premium-blue-500)]">
                                    {p.name}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-[var(--text-muted)]">Width (px)</label>
                                <input type="number" value={width} onChange={(e) => setWidth(+e.target.value)} className="glass-input mt-1" />
                            </div>
                            <div>
                                <label className="text-sm text-[var(--text-muted)]">Height (px)</label>
                                <input type="number" value={height} onChange={(e) => setHeight(+e.target.value)} className="glass-input mt-1" />
                            </div>
                        </div>
                    </div>

                    <Button variant="primary" size="lg" className="w-full" onClick={handleResize} loading={isProcessing} disabled={files.length === 0}>
                        <Move className="w-5 h-5" /> Resize to {width} x {height}
                    </Button>

                    {results.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Check className="w-5 h-5 text-green-400" />
                                <h2 className="text-lg font-semibold">Resize Complete</h2>
                            </div>
                            <div className="space-y-3">
                                {results.map((result, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[var(--glass-white)] border border-[var(--glass-border)]">
                                        <span className="text-sm truncate">{result.original}</span>
                                        <Button size="sm" onClick={() => downloadFile(result.filename, result.original)}>
                                            <Download className="w-4 h-4" /> Download
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button variant="ghost" className="mt-4 w-full" onClick={() => { clearFiles(); setResults([]); }}>Resize More</Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
