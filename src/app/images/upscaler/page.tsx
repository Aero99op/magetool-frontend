'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Maximize2, ArrowLeft, Download, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import FileDropzone from '@/components/ui/FileDropzone'
import Button from '@/components/ui/Button'
import { useFileStore } from '@/lib/store'
import { imageApi, downloadFile } from '@/lib/api'

const scales = [2, 4, 8]

export default function ImageUpscalerPage() {
    const { files, clearFiles } = useFileStore()
    const [scale, setScale] = useState(2)
    const [isProcessing, setIsProcessing] = useState(false)
    const [results, setResults] = useState<Array<{ filename: string; original: string; new_size: { width: number; height: number } }>>([])

    const handleUpscale = async () => {
        if (files.length === 0) {
            toast.error('Please add at least one image')
            return
        }
        setIsProcessing(true)
        setResults([])
        try {
            const response = await imageApi.upscale(files.map((f) => f.file), scale)
            if (response.data.success) {
                setResults(response.data.files)
                toast.success(`Upscaled ${response.data.files.length} image(s) by ${scale}x`)
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Upscale failed')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <Link href="/images" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Image Tools
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="tool-card-icon w-14 h-14">
                            <Maximize2 className="w-7 h-7 text-[var(--premium-blue-400)]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Image Upscaler</h1>
                            <p className="text-[var(--text-muted)]">Upscale images with AI enhancement</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Upload Images</h2>
                        <FileDropzone accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }} />
                    </div>

                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Scale Factor</h2>
                        <div className="flex gap-3">
                            {scales.map((s) => (
                                <button key={s} onClick={() => setScale(s)} className={`px-6 py-3 rounded-xl font-bold text-lg transition-all ${scale === s ? 'bg-[var(--premium-blue-500)] text-white shadow-glow-sm' : 'bg-[var(--glass-white)] border border-[var(--glass-border)]'}`}>
                                    {s}x
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button variant="primary" size="lg" className="w-full" onClick={handleUpscale} loading={isProcessing} disabled={files.length === 0}>
                        <Maximize2 className="w-5 h-5" /> Upscale {scale}x
                    </Button>

                    {results.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Check className="w-5 h-5 text-green-400" />
                                <h2 className="text-lg font-semibold">Upscale Complete</h2>
                            </div>
                            <div className="space-y-3">
                                {results.map((result, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[var(--glass-white)] border border-[var(--glass-border)]">
                                        <div>
                                            <span className="text-sm">{result.original}</span>
                                            <p className="text-xs text-[var(--text-muted)]">{result.new_size.width} x {result.new_size.height}</p>
                                        </div>
                                        <Button size="sm" onClick={() => downloadFile(result.filename, result.original)}>
                                            <Download className="w-4 h-4" /> Download
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button variant="ghost" className="mt-4 w-full" onClick={() => { clearFiles(); setResults([]); }}>Upscale More</Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
