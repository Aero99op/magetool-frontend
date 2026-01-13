'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Combine, ArrowLeft, Download, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import FileDropzone from '@/components/ui/FileDropzone'
import Button from '@/components/ui/Button'
import { useFileStore } from '@/lib/store'
import { fileApi, downloadFile } from '@/lib/api'

export default function MergePdfPage() {
    const { files, clearFiles } = useFileStore()
    const [isProcessing, setIsProcessing] = useState(false)
    const [result, setResult] = useState<{ filename: string; page_count: number; files_merged: number } | null>(null)

    const handleMerge = async () => {
        if (files.length < 2) {
            toast.error('Please add at least 2 PDF files to merge')
            return
        }

        setIsProcessing(true)
        setResult(null)

        try {
            const response = await fileApi.mergePdfs(files.map((f) => f.file))

            if (response.data.success) {
                setResult(response.data.file)
                toast.success(`Merged ${response.data.file.files_merged} PDFs into one document!`)
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Merge failed'
            toast.error(errorMessage)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleDownload = async () => {
        if (result) {
            await downloadFile(result.filename, 'merged_document.pdf')
            toast.success('Downloaded!')
        }
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
                    <Link href="/files" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to File Tools
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="tool-card-icon w-14 h-14 !bg-gradient-to-br from-orange-500/20 to-amber-500/10 !border-orange-500/30">
                            <Combine className="w-7 h-7 text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Merge PDFs</h1>
                            <p className="text-[var(--text-muted)]">
                                Combine multiple PDF files into one document
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
                    {/* File Upload */}
                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Upload PDF Files</h2>
                        <FileDropzone
                            accept={{
                                'application/pdf': ['.pdf']
                            }}
                            label="Drop PDF files here or click to browse"
                            hint="Files will be merged in the order they are added (up to 40 files)"
                        />
                    </div>

                    {/* Info Box */}
                    <div className="glass-card p-4 border-[var(--premium-blue-500)]/30">
                        <p className="text-sm text-[var(--text-secondary)]">
                            💡 <strong>Tip:</strong> The order of files in the list determines the order in the merged PDF. Add files in the sequence you want them.
                        </p>
                    </div>

                    {/* Merge Button */}
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full !bg-gradient-to-r !from-orange-500 !to-amber-600 hover:!from-orange-400 hover:!to-amber-500"
                        onClick={handleMerge}
                        loading={isProcessing}
                        disabled={files.length < 2}
                    >
                        <Combine className="w-5 h-5" />
                        Merge {files.length} PDF{files.length !== 1 ? 's' : ''} into One
                    </Button>

                    {/* Result */}
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-panel p-6"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Check className="w-5 h-5 text-green-400" />
                                <h2 className="text-lg font-semibold">Merge Complete!</h2>
                            </div>

                            <div className="p-4 rounded-xl bg-[var(--glass-white)] border border-[var(--glass-border)] mb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">merged_document.pdf</p>
                                        <p className="text-sm text-[var(--text-muted)]">
                                            {result.page_count} pages • {result.files_merged} files merged
                                        </p>
                                    </div>
                                    <Button size="sm" onClick={handleDownload}>
                                        <Download className="w-4 h-4" />
                                        Download
                                    </Button>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => {
                                    clearFiles()
                                    setResult(null)
                                }}
                            >
                                Merge More PDFs
                            </Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
