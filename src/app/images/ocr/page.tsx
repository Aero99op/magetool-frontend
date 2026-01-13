'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ScanText, ArrowLeft, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import FileDropzone from '@/components/ui/FileDropzone'
import Button from '@/components/ui/Button'
import { useFileStore } from '@/lib/store'
import { imageApi } from '@/lib/api'

export default function OCRPage() {
    const { files, clearFiles } = useFileStore()
    const [isProcessing, setIsProcessing] = useState(false)
    const [results, setResults] = useState<Array<{ original: string; text: string; char_count: number }>>([])
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

    const handleOCR = async () => {
        if (files.length === 0) {
            toast.error('Please add at least one image')
            return
        }

        setIsProcessing(true)
        setResults([])

        try {
            const response = await imageApi.ocr(files.map((f) => f.file))

            if (response.data.success) {
                setResults(response.data.results)
                toast.success(`Extracted text from ${response.data.results.length} image(s)`)
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'OCR failed'
            toast.error(errorMessage)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text)
        setCopiedIndex(index)
        toast.success('Copied to clipboard!')
        setTimeout(() => setCopiedIndex(null), 2000)
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
                            <ScanText className="w-7 h-7 text-[var(--premium-blue-400)]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">OCR Scanner</h1>
                            <p className="text-[var(--text-muted)]">
                                Extract text from images using optical character recognition
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
                                'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff']
                            }}
                            label="Drop images with text here"
                            hint="Supports scanned documents, screenshots, photos with text"
                        />
                    </div>

                    {/* Scan Button */}
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full"
                        onClick={handleOCR}
                        loading={isProcessing}
                        disabled={files.length === 0}
                    >
                        <ScanText className="w-5 h-5" />
                        Extract Text from {files.length > 0 ? `${files.length} Image${files.length > 1 ? 's' : ''}` : 'Images'}
                    </Button>

                    {/* Results */}
                    {results.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <h2 className="text-lg font-semibold">Extracted Text</h2>

                            {results.map((result, i) => (
                                <div
                                    key={i}
                                    className="glass-panel p-6"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-[var(--text-muted)]">{result.original}</span>
                                        <span className="text-xs text-[var(--text-muted)]">{result.char_count} characters</span>
                                    </div>

                                    <div className="relative">
                                        <pre className="p-4 rounded-xl bg-[var(--black-surface)] border border-[var(--glass-border)] text-sm whitespace-pre-wrap font-mono max-h-[300px] overflow-y-auto">
                                            {result.text || '(No text detected)'}
                                        </pre>

                                        {result.text && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="absolute top-2 right-2"
                                                onClick={() => handleCopy(result.text, i)}
                                            >
                                                {copiedIndex === i ? (
                                                    <Check className="w-4 h-4 text-green-400" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => {
                                    clearFiles()
                                    setResults([])
                                }}
                            >
                                Scan More Images
                            </Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
