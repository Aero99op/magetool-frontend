'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Loader2, Download, Check, Zap, Clock } from 'lucide-react'

export type ProgressStage = 'idle' | 'uploading' | 'processing' | 'downloading' | 'completed' | 'error'

interface ProgressTrackerProps {
    stage: ProgressStage
    percent?: number
    message?: string
    speed?: string
    eta?: string
    className?: string
}

const stageConfig = {
    idle: { icon: Upload, color: 'var(--text-muted)', label: 'Ready' },
    uploading: { icon: Upload, color: '#3b82f6', label: 'Uploading' },
    processing: { icon: Loader2, color: '#a855f7', label: 'Processing' },
    downloading: { icon: Download, color: '#22c55e', label: 'Downloading' },
    completed: { icon: Check, color: '#22c55e', label: 'Complete' },
    error: { icon: Upload, color: '#ef4444', label: 'Error' },
}

export default function ProgressTracker({
    stage,
    percent = 0,
    message,
    speed,
    eta,
    className = '',
}: ProgressTrackerProps) {
    if (stage === 'idle') return null

    const config = stageConfig[stage]
    const Icon = config.icon
    const isAnimating = stage === 'processing'
    const isComplete = stage === 'completed'

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`glass-panel p-5 ${className}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${config.color}20` }}
                        >
                            <Icon
                                className={`w-5 h-5 ${isAnimating ? 'animate-spin' : ''}`}
                                style={{ color: config.color }}
                            />
                        </div>
                        <div>
                            <p className="font-semibold" style={{ color: config.color }}>
                                {config.label}
                            </p>
                            {message && (
                                <p className="text-sm text-[var(--text-muted)]">{message}</p>
                            )}
                        </div>
                    </div>

                    {!isComplete && percent > 0 && (
                        <span className="text-2xl font-bold" style={{ color: config.color }}>
                            {Math.round(percent)}%
                        </span>
                    )}

                    {isComplete && (
                        <Check className="w-6 h-6 text-green-500" />
                    )}
                </div>

                {/* Progress Bar */}
                {!isComplete && (
                    <div className="relative h-3 bg-[var(--glass-white)] rounded-full overflow-hidden">
                        <motion.div
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{
                                background: stage === 'processing' && percent === 0
                                    ? `linear-gradient(90deg, transparent, ${config.color}, transparent)`
                                    : config.color,
                            }}
                            initial={{ width: 0 }}
                            animate={{
                                width: percent > 0 ? `${percent}%` : '100%',
                                x: stage === 'processing' && percent === 0 ? ['-100%', '100%'] : 0,
                            }}
                            transition={
                                stage === 'processing' && percent === 0
                                    ? { repeat: Infinity, duration: 1.5, ease: 'linear' }
                                    : { duration: 0.3 }
                            }
                        />
                    </div>
                )}

                {/* Stats */}
                {(speed || eta) && (
                    <div className="flex gap-6 mt-3 text-sm text-[var(--text-muted)]">
                        {speed && (
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-500" />
                                <span>{speed}</span>
                            </div>
                        )}
                        {eta && (
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span>ETA: {eta}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Step Indicator */}
                {!isComplete && stage !== 'error' && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                        {['uploading', 'processing', 'downloading'].map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <div
                                    className={`w-2 h-2 rounded-full transition-all ${stage === s
                                            ? 'w-6 bg-[var(--premium-blue-500)]'
                                            : ['uploading', 'processing', 'downloading'].indexOf(stage) > i
                                                ? 'bg-green-500'
                                                : 'bg-[var(--glass-border)]'
                                        }`}
                                />
                                {i < 2 && (
                                    <div className="w-8 h-0.5 bg-[var(--glass-border)]" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    )
}
