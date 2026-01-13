'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileImage, ArrowLeft, Download, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import FileDropzone from '@/components/ui/FileDropzone'
import Button from '@/components/ui/Button'
import { useFileStore } from '@/lib/store'
import { imageApi, downloadFile } from '@/lib/api'

export default function ImageToPdfPage() {
    const { files, clearFiles } = useFileStore()
    const [isProcessing, setIsProcessing] = useState(false)
    const [result, setResult] = useState<{ filename: string; page_count: number } | null>(null)

    const handleConvert = async () => {
        if (files.length === 0) {
            toast.error('Please add at least one image')
            return
        }

        setIsProcessing(true)
        setResult(null)

        try {
            const response = await imageApi.toPdf(files.map((f) => f.file))

            if (response.data.success) {
                setResult(response.data.file)
                toast.success(`Created PDF with ${response.data.file.page_count} page(s)`)
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Conversion failed')
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
                            <FileImage className="w-7 h-7 text-[var(--premium-blue-400)]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Image to PDF</h1>
                            <p className="text-[var(--text-muted)]">Convert images into a PDF document</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Upload Images</h2>
                        <FileDropzone
                            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp'] }}
                            label="Drop images here (order matters)"
                            hint="Images will be converted to PDF pages in order"
                        />
                    </div>

                    <Button variant="primary" size="lg" className="w-full" onClick={handleConvert} loading={isProcessing} disabled={files.length === 0}>
                        <FileImage className="w-5 h-5" />
                        Create PDF from {files.length} Image{files.length !== 1 ? 's' : ''}
                    </Button>

                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Check className="w-5 h-5 text-green-400" />
                                <h2 className="text-lg font-semibold">PDF Created!</h2>
                            </div>
                            <div className="p-4 rounded-xl bg-[var(--glass-white)] border border-[var(--glass-border)] mb-4">
                                <p className="font-medium">document.pdf</p>
                                <p className="text-sm text-[var(--text-muted)]">{result.page_count} page(s)</p>
                            </div>
                            <Button className="w-full" onClick={() => downloadFile(result.filename, 'document.pdf')}>
                                <Download className="w-4 h-4" /> Download PDF
                            </Button>
                            <Button variant="ghost" className="mt-4 w-full" onClick={() => { clearFiles(); setResult(null); }}>
                                Convert More Images
                            </Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
