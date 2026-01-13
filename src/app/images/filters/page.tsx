'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Palette, ArrowLeft, Download, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import FileDropzone from '@/components/ui/FileDropzone'
import Button from '@/components/ui/Button'
import { useFileStore } from '@/lib/store'
import { imageApi, downloadFile, ensureExtension } from '@/lib/api'

const filters = [
    { id: 'grayscale', name: 'Grayscale', color: 'bg-gray-500' },
    { id: 'sepia', name: 'Sepia', color: 'bg-amber-700' },
    { id: 'blur', name: 'Blur', color: 'bg-blue-400' },
    { id: 'sharpen', name: 'Sharpen', color: 'bg-purple-500' },
    { id: 'contour', name: 'Contour', color: 'bg-pink-500' },
    { id: 'emboss', name: 'Emboss', color: 'bg-indigo-500' },
    { id: 'brightness', name: 'Brightness', color: 'bg-yellow-500' },
    { id: 'contrast', name: 'Contrast', color: 'bg-orange-500' },
]

export default function FiltersPage() {
    const { files, clearFiles } = useFileStore()
    const [selectedFilter, setSelectedFilter] = useState('grayscale')
    const [isProcessing, setIsProcessing] = useState(false)
    const [results, setResults] = useState<Array<{ filename: string; original: string }>>([])

    const handleApply = async () => {
        if (files.length === 0) {
            toast.error('Please add at least one image')
            return
        }
        setIsProcessing(true)
        setResults([])
        try {
            const response = await imageApi.filter(files.map((f) => f.file), selectedFilter)
            if (response.data.success) {
                setResults(response.data.files)
                toast.success(`Applied ${selectedFilter} filter!`)
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed')
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
                            <Palette className="w-7 h-7 text-[var(--premium-blue-400)]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Image Filters</h1>
                            <p className="text-[var(--text-muted)]">Apply artistic filters and effects</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Upload Images</h2>
                        <FileDropzone accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }} />
                    </div>

                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Select Filter</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {filters.map((f) => (
                                <button key={f.id} onClick={() => setSelectedFilter(f.id)} className={`p-4 rounded-xl text-center transition-all ${selectedFilter === f.id ? 'ring-2 ring-[var(--premium-blue-500)] bg-[var(--glass-white-hover)]' : 'bg-[var(--glass-white)] border border-[var(--glass-border)]'}`}>
                                    <div className={`w-8 h-8 rounded-full ${f.color} mx-auto mb-2`} />
                                    <span className="text-sm">{f.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button variant="primary" size="lg" className="w-full" onClick={handleApply} loading={isProcessing} disabled={files.length === 0}>
                        <Palette className="w-5 h-5" /> Apply {selectedFilter} Filter
                    </Button>

                    {results.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Check className="w-5 h-5 text-green-400" />
                                <h2 className="text-lg font-semibold">Filters Applied!</h2>
                            </div>
                            <div className="space-y-3">
                                {results.map((result, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[var(--glass-white)] border border-[var(--glass-border)]">
                                        <span className="text-sm truncate">{result.original}</span>
                                        <Button size="sm" onClick={() => downloadFile(result.filename, ensureExtension(result.original, result.filename))}>
                                            <Download className="w-4 h-4" /> Download
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button variant="ghost" className="mt-4 w-full" onClick={() => { clearFiles(); setResults([]); }}>Apply More Filters</Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
