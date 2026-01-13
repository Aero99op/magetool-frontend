'use client'

import { useCallback, useState } from 'react'
import { useDropzone, Accept } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, File, Image, Video, Music, FileText, Loader2 } from 'lucide-react'
import { cn, formatBytes } from '@/lib/utils'
import { useFileStore, FileItem } from '@/lib/store'

interface FileDropzoneProps {
    accept?: Accept
    maxFiles?: number
    maxSize?: number
    onFilesAdded?: (files: File[]) => void
    disabled?: boolean
    label?: string
    hint?: string
}

const iconMap: Record<string, typeof File> = {
    image: Image,
    video: Video,
    audio: Music,
    application: FileText,
}

function getFileIcon(type: string) {
    const category = type.split('/')[0]
    return iconMap[category] || File
}

export default function FileDropzone({
    accept,
    maxFiles = 40,
    maxSize = 500 * 1024 * 1024, // 500MB
    onFilesAdded,
    disabled = false,
    label = 'Drop files here or click to browse',
    hint = 'Supports up to 40 files',
}: FileDropzoneProps) {
    const { files, addFiles, removeFile, clearFiles } = useFileStore()
    const [isDragActive, setIsDragActive] = useState(false)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        addFiles(acceptedFiles)
        onFilesAdded?.(acceptedFiles)
    }, [addFiles, onFilesAdded])

    const { getRootProps, getInputProps, isDragReject } = useDropzone({
        onDrop,
        accept,
        maxFiles,
        maxSize,
        disabled,
        onDragEnter: () => setIsDragActive(true),
        onDragLeave: () => setIsDragActive(false),
    })

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={cn(
                    'dropzone relative',
                    isDragActive && 'active',
                    isDragReject && 'border-red-500',
                    disabled && 'opacity-50 cursor-not-allowed'
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--premium-blue-500)]/20 to-[var(--premium-blue-700)]/10 flex items-center justify-center border border-[var(--premium-blue-500)]/30">
                        <Upload className="w-8 h-8 text-[var(--premium-blue-400)]" />
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-medium text-[var(--text-primary)]">{label}</p>
                        <p className="text-sm text-[var(--text-muted)] mt-1">{hint}</p>
                    </div>
                </div>
            </div>

            {/* File List */}
            <AnimatePresence mode="popLayout">
                {files.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="glass-card p-4"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-[var(--text-secondary)]">
                                {files.length} file{files.length !== 1 ? 's' : ''} selected
                            </span>
                            <button
                                onClick={clearFiles}
                                className="text-sm text-[var(--text-muted)] hover:text-red-400 transition-colors"
                            >
                                Clear all
                            </button>
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {files.map((item) => (
                                <FileListItem key={item.id} item={item} onRemove={removeFile} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function FileListItem({ item, onRemove }: { item: FileItem; onRemove: (id: string) => void }) {
    const Icon = getFileIcon(item.type)

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-[var(--glass-white)] border border-[var(--glass-border)] group"
        >
            <div className="w-10 h-10 rounded-lg bg-[var(--black-surface)] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-[var(--premium-blue-400)]" />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span>{formatBytes(item.size)}</span>
                    {item.status === 'uploading' && (
                        <>
                            <span>•</span>
                            <span>{item.progress}%</span>
                        </>
                    )}
                    {item.status === 'processing' && (
                        <>
                            <span>•</span>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Processing...</span>
                        </>
                    )}
                    {item.status === 'completed' && (
                        <>
                            <span>•</span>
                            <span className="text-green-400">Completed</span>
                        </>
                    )}
                    {item.status === 'error' && (
                        <>
                            <span>•</span>
                            <span className="text-red-400">Error</span>
                        </>
                    )}
                </div>

                {/* Progress Bar */}
                {(item.status === 'uploading' || item.status === 'processing') && (
                    <div className="progress-bar mt-2">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${item.progress}%` }}
                        />
                    </div>
                )}
            </div>

            <button
                onClick={() => onRemove(item.id)}
                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[var(--black-hover)] transition-all"
            >
                <X className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
        </motion.div>
    )
}
