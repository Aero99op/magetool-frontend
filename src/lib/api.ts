import axios, { AxiosProgressEvent } from 'axios'

// In Docker: frontend connects to Nginx on port 80 which proxies to backend
// In dev: frontend connects to backend directly on port 8000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Get or generate Client ID
const getClientId = () => {
    if (typeof window === 'undefined') return 'server-side'
    let id = localStorage.getItem('magetool_client_id')
    if (!id) {
        id = crypto.randomUUID()
        localStorage.setItem('magetool_client_id', id)
    }
    return id
}

// Get backend URL - works for both localhost and production
const getBackendUrl = () => {
    if (typeof window === 'undefined') return API_BASE_URL

    const hostname = window.location.hostname
    if (hostname.includes('vercel.app') || hostname.includes('magetool')) {
        // Production - use HF Spaces directly
        return 'https://notaero-magetool-api.hf.space'
    } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Localhost - use Docker nginx on port 80
        return 'http://localhost'
    }
    return API_BASE_URL
}

export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 300000, // 5 minutes for large file uploads
})

// Add Client ID to requests
api.interceptors.request.use((config) => {
    config.headers['X-Client-ID'] = getClientId()
    return config
})

// Helper to create FormData from files
export function createFormData(files: File[], additionalData?: Record<string, string>): FormData {
    const formData = new FormData()
    files.forEach((file) => {
        formData.append('files', file)
    })
    if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, value)
        })
    }
    return formData
}

// Progress tracking upload
export async function uploadWithProgress(
    endpoint: string,
    formData: FormData,
    onProgress?: (progress: number) => void
) {
    return api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (progressEvent.total && onProgress) {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                onProgress(progress)
            }
        },
    })
}

// Mime type to extension mapping
type MimeMap = Record<string, string>
const mimeToExt: MimeMap = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/bmp': '.bmp',
    'image/tiff': '.tiff',
    'image/x-icon': '.ico',
    'application/pdf': '.pdf',
    'application/zip': '.zip',
    'text/plain': '.txt',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
    'audio/ogg': '.ogg',
    'audio/x-m4a': '.m4a',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
}

// Helper to ensure download name has proper extension
export function ensureExtension(downloadName: string, sourceFilename: string): string {
    // If downloadName already has an extension, return as-is
    const lastDot = downloadName.lastIndexOf('.')
    const lastSlash = Math.max(downloadName.lastIndexOf('/'), downloadName.lastIndexOf('\\'))
    if (lastDot > lastSlash && lastDot > 0) {
        return downloadName
    }
    // Extract extension from source filename
    const srcLastDot = sourceFilename.lastIndexOf('.')
    if (srcLastDot > 0) {
        const ext = sourceFilename.substring(srcLastDot)
        return downloadName + ext
    }
    return downloadName
}

// Download file from API - Uses backend endpoint with proper Content-Disposition
export async function downloadFile(filename: string, downloadName?: string) {
    const backendUrl = getBackendUrl()
    // Use /api/download endpoint with download_name query param for proper filename
    const encodedDownloadName = downloadName ? encodeURIComponent(downloadName) : ''
    const fileUrl = `${backendUrl}/api/download/${filename}${downloadName ? `?download_name=${encodedDownloadName}` : ''}`
    console.log('Downloading from:', fileUrl)

    try {
        const response = await fetch(fileUrl)
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('File expired or not found. Please process the file again.')
            }
            throw new Error(`Download failed: ${response.status}`)
        }

        // 1. Try to get filename from Content-Disposition header
        let finalFilename = downloadName || filename
        const disposition = response.headers.get('content-disposition')

        if (disposition && disposition.includes('filename=')) {
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition)
            if (matches != null && matches[1]) {
                finalFilename = matches[1].replace(/['"]/g, '')
            }
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')

        // 2. Ensure filename has an extension - use source filename as reference
        finalFilename = ensureExtension(finalFilename, filename)

        // 3. Additional fallback: Check MIME type if still no extension
        if (!finalFilename.includes('.')) {
            const contentType = response.headers.get('content-type') || blob.type
            const ext = mimeToExt[contentType] || ''
            if (ext) {
                finalFilename += ext
            }
        }

        link.href = url
        link.download = finalFilename
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
    } catch (error) {
        console.error('Download error:', error)
        throw error
    }
}

// Image API
export const imageApi = {
    convert: (files: File[], targetFormat: string, onProgress?: (p: number) => void) => {
        const formData = createFormData(files, { target_format: targetFormat })
        return uploadWithProgress('/api/images/convert', formData, onProgress)
    },

    toPdf: (files: File[], onProgress?: (p: number) => void) => {
        const formData = createFormData(files)
        return uploadWithProgress('/api/images/to-pdf', formData, onProgress)
    },

    crop: (file: File, x: number, y: number, width: number, height: number) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('x', x.toString())
        formData.append('y', y.toString())
        formData.append('width', width.toString())
        formData.append('height', height.toString())
        return api.post('/api/images/crop', formData)
    },

    removeBackground: (files: File[], onProgress?: (p: number) => void) => {
        const formData = createFormData(files)
        return uploadWithProgress('/api/images/remove-background', formData, onProgress)
    },

    upscale: (files: File[], scale: number, onProgress?: (p: number) => void) => {
        const formData = createFormData(files, { scale: scale.toString() })
        return uploadWithProgress('/api/images/upscale', formData, onProgress)
    },

    resize: (files: File[], width: number, height: number, onProgress?: (p: number) => void) => {
        const formData = createFormData(files, { width: width.toString(), height: height.toString() })
        return uploadWithProgress('/api/images/resize', formData, onProgress)
    },

    passport: (file: File, size: string) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('size', size)
        return api.post('/api/images/passport', formData)
    },

    collage: (files: File[], layout: string, columns: number, onProgress?: (p: number) => void) => {
        const formData = createFormData(files, { layout, columns: columns.toString() })
        return uploadWithProgress('/api/images/collage', formData, onProgress)
    },

    filter: (files: File[], filterName: string, onProgress?: (p: number) => void) => {
        const formData = createFormData(files, { filter_name: filterName })
        return uploadWithProgress('/api/images/filter', formData, onProgress)
    },

    ocr: (files: File[], onProgress?: (p: number) => void) => {
        const formData = createFormData(files)
        return uploadWithProgress('/api/images/ocr', formData, onProgress)
    },

    aiCheck: (files: File[], onProgress?: (p: number) => void) => {
        const formData = createFormData(files)
        return uploadWithProgress('/api/images/ai-check', formData, onProgress)
    },
}

// Video API
export const videoApi = {
    convert: (files: File[], targetFormat: string, onProgress?: (p: number) => void) => {
        const formData = createFormData(files, { target_format: targetFormat })
        return uploadWithProgress('/api/videos/convert', formData, onProgress)
    },

    downloadYoutube: (url: string) => {
        const formData = new FormData()
        formData.append('url', url)
        return api.post('/api/videos/youtube-download', formData)
    },

    // Streaming download with real-time progress
    downloadYoutubeWithProgress: (
        url: string,
        onProgress: (data: DownloadProgress) => void,
        onComplete: (data: DownloadComplete) => void,
        onError: (error: string) => void
    ) => {
        const encodedUrl = encodeURIComponent(url)
        const clientId = getClientId()
        const backendUrl = getBackendUrl()
        const eventSource = new EventSource(`${backendUrl}/api/videos/youtube-download-stream?url=${encodedUrl}&client_id=${clientId}`)

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.status === 'complete') {
                onComplete(data)
                eventSource.close()
            } else if (data.status === 'error') {
                onError(data.error)
                eventSource.close()
            } else {
                onProgress(data)
            }
        }

        eventSource.onerror = () => {
            onError('Connection lost')
            eventSource.close()
        }

        return eventSource
    },

    downloadInstagram: (url: string) => {
        const formData = new FormData()
        formData.append('url', url)
        return api.post('/api/videos/instagram-download', formData)
    },

    downloadInstagramWithProgress: (
        url: string,
        onProgress: (data: DownloadProgress) => void,
        onComplete: (data: DownloadComplete) => void,
        onError: (error: string) => void
    ) => {
        const encodedUrl = encodeURIComponent(url)
        const clientId = getClientId()
        const backendUrl = getBackendUrl()
        const eventSource = new EventSource(`${backendUrl}/api/videos/instagram-download-stream?url=${encodedUrl}&client_id=${clientId}`)

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.status === 'complete') {
                onComplete(data)
                eventSource.close()
            } else if (data.status === 'error') {
                onError(data.error)
                eventSource.close()
            } else {
                onProgress(data)
            }
        }

        eventSource.onerror = () => {
            onError('Connection lost')
            eventSource.close()
        }

        return eventSource
    },

    downloadShorts: (url: string) => {
        const formData = new FormData()
        formData.append('url', url)
        return api.post('/api/videos/shorts-download', formData)
    },

    downloadShortsWithProgress: (
        url: string,
        onProgress: (data: DownloadProgress) => void,
        onComplete: (data: DownloadComplete) => void,
        onError: (error: string) => void
    ) => {
        const encodedUrl = encodeURIComponent(url)
        const clientId = getClientId()
        const backendUrl = getBackendUrl()
        const eventSource = new EventSource(`${backendUrl}/api/videos/shorts-download-stream?url=${encodedUrl}&client_id=${clientId}`)

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.status === 'complete') {
                onComplete(data)
                eventSource.close()
            } else if (data.status === 'error') {
                onError(data.error)
                eventSource.close()
            } else {
                onProgress(data)
            }
        }

        eventSource.onerror = () => {
            onError('Connection lost')
            eventSource.close()
        }

        return eventSource
    },

    downloadReels: (url: string) => {
        const formData = new FormData()
        formData.append('url', url)
        return api.post('/api/videos/reels-download', formData)
    },

    downloadReelsWithProgress: (
        url: string,
        onProgress: (data: DownloadProgress) => void,
        onComplete: (data: DownloadComplete) => void,
        onError: (error: string) => void
    ) => {
        const encodedUrl = encodeURIComponent(url)
        const clientId = getClientId()
        const backendUrl = getBackendUrl()
        const eventSource = new EventSource(`${backendUrl}/api/videos/reels-download-stream?url=${encodedUrl}&client_id=${clientId}`)

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.status === 'complete') {
                onComplete(data)
                eventSource.close()
            } else if (data.status === 'error') {
                onError(data.error)
                eventSource.close()
            } else {
                onProgress(data)
            }
        }

        eventSource.onerror = () => {
            onError('Connection lost')
            eventSource.close()
        }

        return eventSource
    },

    extractAudio: (files: File[], onProgress?: (p: number) => void) => {
        const formData = createFormData(files)
        return uploadWithProgress('/api/videos/extract-audio', formData, onProgress)
    },

    aiIdentify: (files: File[], onProgress?: (p: number) => void) => {
        const formData = createFormData(files)
        return uploadWithProgress('/api/videos/ai-identify', formData, onProgress)
    },
}

// Types for streaming downloads
export interface DownloadProgress {
    status: 'starting' | 'downloading' | 'processing'
    percent?: string
    percent_num?: number
    speed?: string
    eta?: string
    downloaded?: string
    total?: string
    message?: string
}

export interface DownloadComplete {
    status: 'complete'
    filename: string
    title: string
    duration?: number
    size: number
}

// Audio API
export const audioApi = {
    convert: (files: File[], targetFormat: string, onProgress?: (p: number) => void) => {
        const formData = createFormData(files, { target_format: targetFormat })
        return uploadWithProgress('/api/audio/convert', formData, onProgress)
    },

    trim: (file: File, startTime: number, endTime: number) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('start_time', startTime.toString())
        formData.append('end_time', endTime.toString())
        return api.post('/api/audio/trim', formData)
    },

    identify: (files: File[], onProgress?: (p: number) => void) => {
        const formData = createFormData(files)
        return uploadWithProgress('/api/audio/identify', formData, onProgress)
    },

    download: (url: string) => {
        const formData = new FormData()
        formData.append('url', url)
        return api.post('/api/audio/download', formData)
    },
}

// File API
export const fileApi = {
    convert: (files: File[], targetFormat: string, onProgress?: (p: number) => void) => {
        const formData = createFormData(files, { target_format: targetFormat })
        return uploadWithProgress('/api/files/convert', formData, onProgress)
    },

    ocr: (files: File[], onProgress?: (p: number) => void) => {
        const formData = createFormData(files)
        return uploadWithProgress('/api/files/ocr', formData, onProgress)
    },

    edit: (file: File, content: string) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('content', content)
        return api.post('/api/files/edit', formData)
    },

    mergePdfs: (files: File[], onProgress?: (p: number) => void) => {
        const formData = createFormData(files)
        return uploadWithProgress('/api/files/merge-pdf', formData, onProgress)
    },

    splitPdf: (file: File, pages: string) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('pages', pages)
        return api.post('/api/files/split-pdf', formData)
    },
}
