'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, ArrowLeft, Download, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import { imageApi, downloadFile } from '@/lib/api'

const sizes = [
    { id: '2x2', name: 'US (2x2 inch)', desc: '600x600 px' },
    { id: '35x45', name: 'EU (35x45 mm)', desc: '413x531 px' },
    { id: '35x35', name: 'India (35x35 mm)', desc: '413x413 px' },
    { id: '33x48', name: 'UK (35x45 mm)', desc: '390x567 px' },
]

export default function PassportPhotoPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [size, setSize] = useState('2x2')
    const [isProcessing, setIsProcessing] = useState(false)
    const [result, setResult] = useState<{ filename: string } | null>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
            setResult(null)
        }
    }

    const handleCreate = async () => {
        if (!selectedFile) return
        setIsProcessing(true)
        try {
            const response = await imageApi.passport(selectedFile, size)
            if (response.data.success) {
                setResult(response.data.file)
                toast.success('Passport photo created!')
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
                            <User className="w-7 h-7 text-[var(--premium-blue-400)]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Passport Photo Maker</h1>
                            <p className="text-[var(--text-muted)]">Create passport-sized photos for any country</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Upload Photo</h2>
                        <input type="file" accept="image/*" onChange={handleFileSelect} className="glass-input" />
                        {previewUrl && <img src={previewUrl} alt="Preview" className="mt-4 max-h-[300px] rounded-lg" />}
                    </div>

                    <div className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4">Select Size</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {sizes.map((s) => (
                                <button key={s.id} onClick={() => setSize(s.id)} className={`p-4 rounded-xl text-left transition-all ${size === s.id ? 'bg-[var(--premium-blue-500)] text-white' : 'bg-[var(--glass-white)] border border-[var(--glass-border)]'}`}>
                                    <p className="font-medium">{s.name}</p>
                                    <p className="text-sm opacity-70">{s.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button variant="primary" size="lg" className="w-full" onClick={handleCreate} loading={isProcessing} disabled={!selectedFile}>
                        <User className="w-5 h-5" /> Create Passport Photo
                    </Button>

                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Check className="w-5 h-5 text-green-400" />
                                <h2 className="text-lg font-semibold">Passport Photo Ready!</h2>
                            </div>
                            <Button className="w-full" onClick={() => downloadFile(result.filename, 'passport_photo.png')}>
                                <Download className="w-4 h-4" /> Download Photo
                            </Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
