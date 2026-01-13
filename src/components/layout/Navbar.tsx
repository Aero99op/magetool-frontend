'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Image,
    Video,
    Music,
    FileText,
    Menu,
    X,
    Wand2
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
    { href: '/images', label: 'Images', icon: Image },
    { href: '/videos', label: 'Videos', icon: Video },
    { href: '/audio', label: 'Audio', icon: Music },
    { href: '/files', label: 'Files', icon: FileText },
]

export default function Navbar() {
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50">
            <nav className="glass-panel border-b border-t-0 rounded-none">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--premium-blue-500)] to-[var(--premium-blue-700)] flex items-center justify-center group-hover:shadow-glow-sm transition-shadow">
                                <Wand2 className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold">
                                <span className="text-gradient">Mage</span>
                                <span className="text-[var(--premium-blue-400)]">tool</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                const isActive = pathname?.startsWith(item.href)
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'nav-link flex items-center gap-2',
                                            isActive && 'active'
                                        )}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-[var(--glass-white-hover)] transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-[var(--glass-border)]"
                        >
                            <div className="px-6 py-4 space-y-2">
                                {navItems.map((item) => {
                                    const isActive = pathname?.startsWith(item.href)
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                'nav-link flex items-center gap-3 w-full',
                                                isActive && 'active'
                                            )}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            {item.label}
                                        </Link>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    )
}
