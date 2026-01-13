'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, ArrowLeft, Download, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import FileDropzone from '@/components/ui/FileDropzone'
import Button from '@/components/ui/Button'
import { useFileStore } from '@/lib/store'
import { audioApi, downloadFile } from '@/lib/api'

const formats = ['MP3', 'WAV', 'OGG', 'FLAC', 'AAC', 'M4A', 'WMA']

export default function AudioConverterPage() {
    const { files, updateFileStatus, updateFileResult, clearFiles } = useFileStore()
    const [targetFormat, setTargetFormat] = useState('MP3')
    const [isProcessing, setIsProcessing] = useState(false)
    const [results, setResults] = useState<Array<{ filename: string; original: string }>>([])

    const handleConvert = async () => {
        if (files.length === 0) {
            toast.error('Please add at least one audio file')
            return
        }

        setIsProcessing(true)
        setResults([])

        try {
            files.forEach((f) => updateFileStatus(f.id, 'uploading', 0))

            const response = await audioApi.convert(
                files.map((f) => f.file),
                targetFormat.toLowerCase(),
                (progress) => {
                    files.forEach((f) => updateFileStatus(f.id, 'uploading', progress))
                }
            )

            if (response.data.success) {
                const convertedFiles = response.data.files
                setResults(convertedFiles)

                files.forEach((f, i) => {
                    if (convertedFiles[i]) {
                        updateFileResult(f.id, convertedFiles[i])
                    }
                })

                toast.success(`Converted ${convertedFiles.length} audio file(s) to ${targetFormat}`)
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Conversion failed'
            toast.error(errorMessage)
            files.forEach((f) => updateFileStatus(f.id, 'error'))
        } finally {
            setIsProcessing(false)
        }
    }

    const handleDownload = async (filename: string, originalName: string) => {
        const ext = targetFormat.toLowerCase()
        const newName = originalName.replace(/\.[^/.]+$/, `.${ext}`)
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
                    <Link href="/audio" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Audio Tools
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="tool-card-icon w-14 h-14 !bg-gradient-to-br from-green-500/20 to-emerald-500/10 !border-green-500/30">
                            <RefreshCw className="w-7 h-7 text-green-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Audio Converter</h1>
                            <p className="text-[var(--text-muted)]">
                                Convert audio between different formats
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
                        <h2 className="text-lg font-semibold mb-4">Upload Audio Files</h2>
                        <FileDropzone
                            accept={{
                                'audio/*': ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a', '.wma']
                            }}
                            label="Drop audio files here or click to browse"
                            hint="Supports MP3, WAV, OGG, FLAC, AAC, M4A, WMA (up to 40 files)"
                        />
                    </div>

                    {/* Format Selection */}
                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Target Format</h2>
                        <div className="flex flex-wrap gap-3">
                            {formats.map((format) => (
                                <button
                                    key={format}
                                    onClick={() => setTargetFormat(format)}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all ${targetFormat === format
                                            ? 'bg-green-500 text-white shadow-glow-sm'
                                            : 'bg-[var(--glass-white)] border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)]'
                                        }`}
                                >
                                    {format}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Convert Button */}
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full !bg-gradient-to-r !from-green-500 !to-emerald-600 hover:!from-green-400 hover:!to-emerald-500"
                        onClick={handleConvert}
                        loading={isProcessing}
                        disabled={files.length === 0}
                    >
                        <RefreshCw className="w-5 h-5" />
                        Convert {files.length > 0 ? `${files.length} File${files.length > 1 ? 's' : ''}` : 'Files'} to {targetFormat}
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
                                <h2 className="text-lg font-semibold">Conversion Complete</h2>
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
                                            Download
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
                                Convert More Files
                            </Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
