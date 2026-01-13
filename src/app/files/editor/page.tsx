'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit, ArrowLeft, Download, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import { fileApi, downloadFile } from '@/lib/api'

export default function FileEditorPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [content, setContent] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [result, setResult] = useState<{ filename: string } | null>(null)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            setResult(null)
            setIsLoading(true)
            try {
                const text = await file.text()
                setContent(text)
            } catch {
                toast.error('Could not read file')
            } finally {
                setIsLoading(false)
            }
        }
    }

    const handleSave = async () => {
        if (!selectedFile) return
        setIsProcessing(true)
        try {
            const response = await fileApi.edit(selectedFile, content)
            if (response.data.success) {
                setResult(response.data.file)
                toast.success('File saved!')
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Save failed')
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
                            <Edit className="w-7 h-7 text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">File Editor</h1>
                            <p className="text-[var(--text-muted)]">Edit text content in documents</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Select Text File</h2>
                        <input type="file" accept=".txt,.md,.json,.xml,.html,.css,.js" onChange={handleFileSelect} className="glass-input" />
                        {selectedFile && <p className="mt-2 text-sm text-[var(--text-muted)]">Editing: {selectedFile.name}</p>}
                    </div>

                    {selectedFile && (
                        <div className="glass-panel p-6">
                            <h2 className="text-lg font-semibold mb-4">Edit Content</h2>
                            {isLoading ? (
                                <div className="text-center py-8 text-[var(--text-muted)]">Loading...</div>
                            ) : (
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full h-[400px] p-4 rounded-xl bg-[var(--black-surface)] border border-[var(--glass-border)] text-sm font-mono resize-none focus:outline-none focus:border-[var(--premium-blue-500)]"
                                    spellCheck={false}
                                />
                            )}
                        </div>
                    )}

                    <Button variant="primary" size="lg" className="w-full !bg-gradient-to-r !from-orange-500 !to-amber-600" onClick={handleSave} loading={isProcessing} disabled={!selectedFile}>
                        <Edit className="w-5 h-5" /> Save Changes
                    </Button>

                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Check className="w-5 h-5 text-green-400" />
                                <h2 className="text-lg font-semibold">File Saved!</h2>
                            </div>
                            <Button className="w-full" onClick={() => downloadFile(result.filename, selectedFile?.name || 'edited_file.txt')}>
                                <Download className="w-4 h-4" /> Download Edited File
                            </Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
