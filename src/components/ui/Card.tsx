'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
    children: ReactNode
    className?: string
    hover?: boolean
    onClick?: () => void
}

export default function Card({ children, className, hover = true, onClick }: CardProps) {
    return (
        <div
            className={cn(
                'glass-card p-6',
                hover && 'hover:shadow-glass-hover',
                onClick && 'cursor-pointer',
                className
            )}
            onClick={onClick}
        >
            {children}
        </div>
    )
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn('mb-4', className)}>
            {children}
        </div>
    )
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <h3 className={cn('text-xl font-semibold', className)}>
            {children}
        </h3>
    )
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <p className={cn('text-[var(--text-muted)] text-sm mt-1', className)}>
            {children}
        </p>
    )
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={className}>
            {children}
        </div>
    )
}
