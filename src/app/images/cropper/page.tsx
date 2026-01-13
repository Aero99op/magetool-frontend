'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Crop, ArrowLeft, Download, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import { imageApi, downloadFile } from '@/lib/api'

export default function ImageCropperPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [cropArea, setCropArea] = useState({ x: 50, y: 50, width: 200, height: 200 })
    const [isProcessing, setIsProcessing] = useState(false)
    const [result, setResult] = useState<{ filename: string } | null>(null)
    const imageRef = useRef<HTMLImageElement>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            setImageUrl(URL.createObjectURL(file))
            setResult(null)
        }
    }

    const handleCrop = async () => {
        if (!selectedFile) return
        setIsProcessing(true)
        try {
            const response = await imageApi.crop(selectedFile, cropArea.x, cropArea.y, cropArea.width, cropArea.height)
            if (response.data.success) {
                setResult(response.data.file)
                toast.success('Image cropped successfully!')
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Crop failed')
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
                            <Crop className="w-7 h-7 text-[var(--premium-blue-400)]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Image Cropper</h1>
                            <p className="text-[var(--text-muted)]">Crop images with custom dimensions</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Select Image</h2>
                        <input type="file" accept="image/*" onChange={handleFileSelect} className="glass-input" />
                    </div>

                    {imageUrl && (
                        <div className="glass-panel p-6">
                            <h2 className="text-lg font-semibold mb-4">Crop Settings</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <label className="text-sm text-[var(--text-muted)]">X Position</label>
                                    <input type="number" value={cropArea.x} onChange={(e) => setCropArea({ ...cropArea, x: +e.target.value })} className="glass-input mt-1" />
                                </div>
                                <div>
                                    <label className="text-sm text-[var(--text-muted)]">Y Position</label>
                                    <input type="number" value={cropArea.y} onChange={(e) => setCropArea({ ...cropArea, y: +e.target.value })} className="glass-input mt-1" />
                                </div>
                                <div>
                                    <label className="text-sm text-[var(--text-muted)]">Width</label>
                                    <input type="number" value={cropArea.width} onChange={(e) => setCropArea({ ...cropArea, width: +e.target.value })} className="glass-input mt-1" />
                                </div>
                                <div>
                                    <label className="text-sm text-[var(--text-muted)]">Height</label>
                                    <input type="number" value={cropArea.height} onChange={(e) => setCropArea({ ...cropArea, height: +e.target.value })} className="glass-input mt-1" />
                                </div>
                            </div>
                            <div className="relative inline-block">
                                <img ref={imageRef} src={imageUrl} alt="Preview" className="max-w-full max-h-[400px] rounded-lg" />
                                <div
                                    className="absolute border-2 border-[var(--premium-blue-500)] bg-[var(--premium-blue-500)]/20"
                                    style={{ left: cropArea.x, top: cropArea.y, width: cropArea.width, height: cropArea.height }}
                                />
                            </div>
                        </div>
                    )}

                    <Button variant="primary" size="lg" className="w-full" onClick={handleCrop} loading={isProcessing} disabled={!selectedFile}>
                        <Crop className="w-5 h-5" /> Crop Image
                    </Button>

                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
                            <Button className="w-full" onClick={() => downloadFile(result.filename, 'cropped_image.png')}>
                                <Download className="w-4 h-4" /> Download Cropped Image
                            </Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
