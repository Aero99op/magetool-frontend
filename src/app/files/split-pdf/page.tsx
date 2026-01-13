'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Split, ArrowLeft, Download, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import { fileApi, downloadFile } from '@/lib/api'

export default function SplitPdfPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [pageRanges, setPageRanges] = useState('1-5, 6-10')
    const [isProcessing, setIsProcessing] = useState(false)
    const [results, setResults] = useState<Array<{ filename: string; page_range: string }>>([])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            setResults([])
        }
    }

    const handleSplit = async () => {
        if (!selectedFile) return
        setIsProcessing(true)
        setResults([])
        try {
            const response = await fileApi.splitPdf(selectedFile, pageRanges)
            if (response.data.success) {
                setResults(response.data.files)
                toast.success(`PDF split into ${response.data.files.length} parts!`)
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Split failed')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <Link href="/files" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to File Tools
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="tool-card-icon w-14 h-14 !bg-gradient-to-br from-orange-500/20 to-amber-500/10 !border-orange-500/30">
                            <Split className="w-7 h-7 text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Split PDF</h1>
                            <p className="text-[var(--text-muted)]">Split a PDF into separate documents</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Select PDF File</h2>
                        <input type="file" accept=".pdf" onChange={handleFileSelect} className="glass-input" />
                        {selectedFile && <p className="mt-2 text-sm text-[var(--text-muted)]">Selected: {selectedFile.name}</p>}
                    </div>

                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Page Ranges</h2>
                        <input
                            type="text"
                            value={pageRanges}
                            onChange={(e) => setPageRanges(e.target.value)}
                            placeholder="e.g., 1-5, 6-10, 11"
                            className="glass-input"
                        />
                        <p className="text-xs text-[var(--text-muted)] mt-2">
                            Enter page ranges separated by commas. Examples: "1-5", "1-3, 5-7", "1, 3, 5-10"
                        </p>
                    </div>

                    <Button variant="primary" size="lg" className="w-full !bg-gradient-to-r !from-orange-500 !to-amber-600" onClick={handleSplit} loading={isProcessing} disabled={!selectedFile}>
                        <Split className="w-5 h-5" /> Split PDF
                    </Button>

                    {results.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Check className="w-5 h-5 text-green-400" />
                                <h2 className="text-lg font-semibold">Split Complete!</h2>
                            </div>
                            <div className="space-y-3">
                                {results.map((result, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[var(--glass-white)] border border-[var(--glass-border)]">
                                        <div>
                                            <span className="text-sm font-medium">Part {i + 1}</span>
                                            <p className="text-xs text-[var(--text-muted)]">Pages: {result.page_range}</p>
                                        </div>
                                        <Button size="sm" onClick={() => downloadFile(result.filename, `split_part_${i + 1}.pdf`)}>
                                            <Download className="w-4 h-4" /> Download
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button variant="ghost" className="mt-4 w-full" onClick={() => { setSelectedFile(null); setResults([]); }}>Split Another</Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
