'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eraser, ArrowLeft, Download, Check, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import FileDropzone from '@/components/ui/FileDropzone'
import Button from '@/components/ui/Button'
import { useFileStore } from '@/lib/store'
import { imageApi, downloadFile } from '@/lib/api'

export default function BackgroundRemoverPage() {
    const { files, updateFileStatus, updateFileResult, clearFiles } = useFileStore()
    const [isProcessing, setIsProcessing] = useState(false)
    const [results, setResults] = useState<Array<{ filename: string; original: string }>>([])

    const handleRemoveBackground = async () => {
        if (files.length === 0) {
            toast.error('Please add at least one image')
            return
        }

        setIsProcessing(true)
        setResults([])

        try {
            files.forEach((f) => updateFileStatus(f.id, 'processing', 50))

            const response = await imageApi.removeBackground(
                files.map((f) => f.file),
                (progress) => {
                    files.forEach((f) => updateFileStatus(f.id, 'processing', progress))
                }
            )

            if (response.data.success) {
                const processedFiles = response.data.files
                setResults(processedFiles)

                files.forEach((f, i) => {
                    if (processedFiles[i]) {
                        updateFileResult(f.id, processedFiles[i])
                    }
                })

                toast.success(`Removed background from ${processedFiles.length} image(s)`)
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Background removal failed'
            toast.error(errorMessage)
            files.forEach((f) => updateFileStatus(f.id, 'error'))
        } finally {
            setIsProcessing(false)
        }
    }

    const handleDownload = async (filename: string, originalName: string) => {
        const newName = originalName.replace(/\.[^/.]+$/, '_no_bg.png')
        await downloadFile(filename, newName)
        toast.success('Downloaded!')
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
                    <Link href="/images" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Image Tools
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="tool-card-icon w-14 h-14">
                            <Eraser className="w-7 h-7 text-[var(--premium-blue-400)]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Background Remover</h1>
                            <p className="text-[var(--text-muted)]">
                                AI-powered background removal for any image
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
                        <h2 className="text-lg font-semibold mb-4">Upload Images</h2>
                        <FileDropzone
                            accept={{
                                'image/*': ['.png', '.jpg', '.jpeg', '.webp']
                            }}
                            label="Drop images here or click to browse"
                            hint="Best results with photos containing clear subjects"
                        />
                    </div>

                    {/* Info Box */}
                    <div className="glass-card p-4 border-[var(--premium-blue-500)]/30">
                        <p className="text-sm text-[var(--text-secondary)]">
                            💡 <strong>Tip:</strong> This tool uses AI (rembg) to detect and remove backgrounds. Works best with photos of people, products, or objects with clear edges.
                        </p>
                    </div>

                    {/* Process Button */}
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full"
                        onClick={handleRemoveBackground}
                        loading={isProcessing}
                        disabled={files.length === 0}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing with AI...
                            </>
                        ) : (
                            <>
                                <Eraser className="w-5 h-5" />
                                Remove Background{files.length > 1 ? 's' : ''}
                            </>
                        )}
                    </Button>

                    {/* Results */}
                    {results.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-panel p-6"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Check className="w-5 h-5 text-green-400" />
                                <h2 className="text-lg font-semibold">Background Removed!</h2>
                            </div>

                            <div className="space-y-3">
                                {results.map((result, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-4 rounded-xl bg-[var(--glass-white)] border border-[var(--glass-border)]"
                                    >
                                        <span className="text-sm truncate flex-1 mr-4">{result.original}</span>
                                        <Button
                                            size="sm"
                                            onClick={() => handleDownload(result.filename, result.original)}
                                        >
                                            <Download className="w-4 h-4" />
                                            Download PNG
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant="ghost"
                                className="mt-4 w-full"
                                onClick={() => {
                                    clearFiles()
                                    setResults([])
                                }}
                            >
                                Process More Images
                            </Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
