'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface TaskProgress {
    taskId: string | null
    progress: number
    status: 'idle' | 'pending' | 'processing' | 'success' | 'error'
    message: string
    result: unknown
}

/**
 * Hook for real-time task progress via WebSocket
 * Usage:
 * const { taskId, progress, status, startTask } = useTaskProgress()
 * await startTask(apiCall)
 */
export function useTaskProgress() {
    const [state, setState] = useState<TaskProgress>({
        taskId: null,
        progress: 0,
        status: 'idle',
        message: '',
        result: null,
    })

    const wsRef = useRef<WebSocket | null>(null)
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (wsRef.current) {
                wsRef.current.close()
            }
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current)
            }
        }
    }, [])

    // Connect to WebSocket for a task
    const connectWebSocket = useCallback((taskId: string) => {
        const wsUrl = `ws://localhost:8000/ws/task/${taskId}`
        const ws = new WebSocket(wsUrl)

        ws.onopen = () => {
            console.log(`WebSocket connected for task: ${taskId}`)
        }

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                setState((prev) => ({
                    ...prev,
                    progress: data.progress || prev.progress,
                    status: data.status === 'complete' ? 'success' : 'processing',
                    message: data.message || '',
                    result: data.result || prev.result,
                }))

                // If complete, close WebSocket
                if (data.status === 'complete' || data.progress === 100) {
                    ws.close()
                }
            } catch (e) {
                console.error('WebSocket message parse error:', e)
            }
        }

        ws.onerror = () => {
            console.log('WebSocket error, falling back to polling')
            startPolling(taskId)
        }

        ws.onclose = () => {
            console.log('WebSocket closed')
        }

        wsRef.current = ws
    }, [])

    // Fallback polling for task status
    const startPolling = useCallback((taskId: string) => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
        }

        pollIntervalRef.current = setInterval(async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/task/${taskId}/status`)
                const data = await response.json()

                setState((prev) => ({
                    ...prev,
                    progress: data.progress || prev.progress,
                    status: data.ready ? 'success' : data.status === 'FAILURE' ? 'error' : 'processing',
                    message: data.message || '',
                    result: data.result || prev.result,
                }))

                // Stop polling if done
                if (data.ready || data.status === 'FAILURE') {
                    if (pollIntervalRef.current) {
                        clearInterval(pollIntervalRef.current)
                    }
                }
            } catch (e) {
                console.error('Polling error:', e)
            }
        }, 2000)
    }, [])

    // Start a task and track progress
    const startTask = useCallback(async <T>(
        apiCall: () => Promise<{ data: { task_id?: string; success?: boolean;[key: string]: unknown } }>
    ): Promise<T | null> => {
        setState({
            taskId: null,
            progress: 0,
            status: 'pending',
            message: 'Starting...',
            result: null,
        })

        try {
            const response = await apiCall()

            // If response has task_id, it's a background task
            if (response.data.task_id) {
                const taskId = response.data.task_id
                setState((prev) => ({
                    ...prev,
                    taskId,
                    status: 'processing',
                    message: 'Processing...',
                }))

                // Try WebSocket first, fallback to polling
                connectWebSocket(taskId)

                // Also start polling as backup
                setTimeout(() => startPolling(taskId), 3000)

                return null // Result will come via WebSocket/polling
            }

            // Otherwise, it's a sync response
            setState({
                taskId: null,
                progress: 100,
                status: 'success',
                message: 'Complete!',
                result: response.data,
            })

            return response.data as T
        } catch (error) {
            setState((prev) => ({
                ...prev,
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed',
            }))
            return null
        }
    }, [connectWebSocket, startPolling])

    // Reset state
    const reset = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close()
        }
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
        }
        setState({
            taskId: null,
            progress: 0,
            status: 'idle',
            message: '',
            result: null,
        })
    }, [])

    return {
        ...state,
        startTask,
        reset,
        isLoading: state.status === 'pending' || state.status === 'processing',
    }
}
