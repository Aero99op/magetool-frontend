'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LayoutGrid, ArrowLeft, Download, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import FileDropzone from '@/components/ui/FileDropzone'
import Button from '@/components/ui/Button'
import { useFileStore } from '@/lib/store'
import { imageApi, downloadFile } from '@/lib/api'

export default function CollagePage() {
    const { files, clearFiles } = useFileStore()
    const [columns, setColumns] = useState(3)
    const [isProcessing, setIsProcessing] = useState(false)
    const [result, setResult] = useState<{ filename: string; image_count: number } | null>(null)

    const handleCreate = async () => {
        if (files.length < 2) {
            toast.error('Please add at least 2 images')
            return
        }
        setIsProcessing(true)
        try {
            const response = await imageApi.collage(files.map((f) => f.file), 'grid', columns)
            if (response.data.success) {
                setResult(response.data.file)
                toast.success('Collage created!')
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
                            <LayoutGrid className="w-7 h-7 text-[var(--premium-blue-400)]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Collage Maker</h1>
                            <p className="text-[var(--text-muted)]">Create beautiful photo collages</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Upload Images</h2>
                        <FileDropzone accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }} hint="Add 2 or more images for your collage" />
                    </div>

                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Grid Columns</h2>
                        <div className="flex gap-3">
                            {[2, 3, 4, 5].map((c) => (
                                <button key={c} onClick={() => setColumns(c)} className={`px-6 py-3 rounded-xl font-bold transition-all ${columns === c ? 'bg-[var(--premium-blue-500)] text-white' : 'bg-[var(--glass-white)] border border-[var(--glass-border)]'}`}>
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button variant="primary" size="lg" className="w-full" onClick={handleCreate} loading={isProcessing} disabled={files.length < 2}>
                        <LayoutGrid className="w-5 h-5" /> Create Collage
                    </Button>

                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Check className="w-5 h-5 text-green-400" />
                                <h2 className="text-lg font-semibold">Collage Ready! ({result.image_count} images)</h2>
                            </div>
                            <Button className="w-full" onClick={() => downloadFile(result.filename, 'collage.png')}>
                                <Download className="w-4 h-4" /> Download Collage
                            </Button>
                            <Button variant="ghost" className="mt-4 w-full" onClick={() => { clearFiles(); setResult(null); }}>Create Another</Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
