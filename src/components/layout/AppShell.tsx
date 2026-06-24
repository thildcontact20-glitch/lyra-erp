'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, BookOpen, ShoppingCart, Package, Users, FileText, MessageSquare, LogOut, Menu, X, ChevronLeft, DollarSign, Receipt } from 'lucide-react'
import { pageVariants } from '../../lib/framerVariants'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/compta', label: 'Comptabilité', icon: BookOpen },
  { href: '/commercial', label: 'Commercial', icon: ShoppingCart },
  { href: '/stocks', label: 'Stocks', icon: Package },
  { href: '/paie', label: 'Paie & CNPS', icon: Users },
  { href: '/fiscalite', label: 'Fiscalité', icon: DollarSign },
  { href: '/etats', label: 'États financiers', icon: FileText },
  { href: '/chat-ohada', label: 'Chat OHADA', icon: MessageSquare },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  return (
    <div className="flex h-screen overflow-hidden bg-lyra-dark">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        className="relative flex flex-col border-r border-white/10 bg-lyra-navy/50 backdrop-blur-xl"
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span className="text-lg font-bold text-lyra-gold">LYRA</span>
                <span className="text-xs text-white/40 ml-2">by Vivalys</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-lyra-gold transition-colors">
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-lyra-gold/10 text-lyra-gold border-l-2 border-lyra-gold'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <Link href="/login">
            <motion.div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all">
              <LogOut className="w-5 h-5" />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">
                    Déconnexion
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
        </div>
      </motion.aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
