import { create } from 'zustand'

export interface FileItem {
    id: string
    file: File
    name: string
    size: number
    type: string
    status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
    progress: number
    result?: {
        filename?: string
        downloadUrl?: string
        text?: string
        error?: string
        [key: string]: unknown
    }
}

interface FileStore {
    files: FileItem[]
    addFiles: (files: File[]) => void
    removeFile: (id: string) => void
    clearFiles: () => void
    updateFileStatus: (id: string, status: FileItem['status'], progress?: number) => void
    updateFileResult: (id: string, result: FileItem['result']) => void
    setFiles: (files: FileItem[]) => void
}

export const useFileStore = create<FileStore>((set) => ({
    files: [],

    addFiles: (files) => {
        const newFiles: FileItem[] = files.slice(0, 40).map((file) => ({
            id: Math.random().toString(36).substring(2, 15),
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'pending',
            progress: 0,
        }))

        set((state) => {
            const totalFiles = state.files.length + newFiles.length
            if (totalFiles > 40) {
                const allowedCount = 40 - state.files.length
                return { files: [...state.files, ...newFiles.slice(0, allowedCount)] }
            }
            return { files: [...state.files, ...newFiles] }
        })
    },

    removeFile: (id) => {
        set((state) => ({
            files: state.files.filter((f) => f.id !== id),
        }))
    },

    clearFiles: () => {
        set({ files: [] })
    },

    updateFileStatus: (id, status, progress) => {
        set((state) => ({
            files: state.files.map((f) =>
                f.id === id ? { ...f, status, progress: progress ?? f.progress } : f
            ),
        }))
    },

    updateFileResult: (id, result) => {
        set((state) => ({
            files: state.files.map((f) =>
                f.id === id ? { ...f, result, status: result?.error ? 'error' : 'completed' } : f
            ),
        }))
    },

    setFiles: (files) => {
        set({ files })
    },
}))

// General UI store
interface UIStore {
    isProcessing: boolean
    setIsProcessing: (processing: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
    isProcessing: false,
    setIsProcessing: (processing) => set({ isProcessing: processing }),
}))
