'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────
interface KnowledgeEntry {
  id: string
  category: string
  question: string
  answer: string
  keywords: string[]
  source: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  source?: string
}

// ─── RAG local engine ─────────────────────────────────────────────────────
function preprocessQuery(query: string): string {
  // Normaliser : remplacer LYRA par OHADA pour matcher les mots-clés de la base
  return query
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\blyra\b/g, 'ohada')
    .replace(/\blyra\b/g, 'syscohada')
}

function findBestMatch(query: string, knowledge: KnowledgeEntry[]): KnowledgeEntry | null {
  const q = preprocessQuery(query)

  // Score each entry based on keyword overlap
  let best: KnowledgeEntry | null = null
  let bestScore = 0

  for (const entry of knowledge) {
    let score = 0
    for (const kw of entry.keywords) {
      const kwNorm = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      if (q.includes(kwNorm)) score += 3
      // also check partial matches
      const words = q.split(/\s+/)
      for (const w of words) {
        if (w.length > 3 && kwNorm.includes(w)) score += 1
      }
    }
    // Also direct question match
    const qNorm = entry.question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    if (qNorm.includes(q) || q.includes(qNorm)) score += 10

    if (score > bestScore) {
      bestScore = score
      best = entry
    }
  }

  return bestScore > 0 ? best : null
}

// ─── API call ─────────────────────────────────────────────────────────────
async function fetchFromApi(message: string): Promise<{ answer: string; source?: string } | null> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return { answer: data.answer || data.response || '', source: data.source }
  } catch {
    return null
  }
}

// ─── Suggestions ──────────────────────────────────────────────────────────
const SUGGESTIONS_ALL = [
  "Qu'est-ce que le LYRA ?",
  'Quels sont les taux de TVA en Côte d\'Ivoire ?',
  'Comment calculer l\'IR salarial ?',
  'Quelles sont les cotisations CNPS ?',
]
const SUGGESTIONS_STARTER = [
  "Qu'est-ce que le LYRA ?",
  'Quels sont les taux de TVA en Côte d\'Ivoire ?',
]

// ─── Component ────────────────────────────────────────────────────────────
export default function ChatOhadaPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([])
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [ready, setReady] = useState(false)
  const [planCode, setPlanCode] = useState<string>('business')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Fetch subscription / plan info ─────────────────────────────
  useEffect(() => {
    fetch('/api/subscription')
      .then(r => r.ok ? r.json() : Promise.reject('fail'))
      .then(res => {
        const d = res.data || {}
        setPlanCode(d.plan?.code || 'business')
      })
      .catch(() => {
        // fallback: assume full access
        setPlanCode('business')
      })
  }, [])

  // ── Load knowledge base ──────────────────────────────────────────────
  useEffect(() => {
    import('../../../data/ohada-knowledge.json').then(
      (mod) => {
        setKnowledge(mod.default || mod)
        setReady(true)
      },
      () => {
        // fallback: try fetch
        fetch('/data/ohada-knowledge.json')
          .then((r) => r.json())
          .then((data) => {
            setKnowledge(data)
            setReady(true)
          })
          .catch(() => {
            console.warn('Knowledge base not found')
            setReady(true)
          })
      },
    )
  }, [])

  // ── Scroll to bottom ─────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // ── Send message ─────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      const t = text.trim()
      if (!t || isLoading) return

      setShowSuggestions(false)

      const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: t }
      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setIsLoading(true)

      // Try API first
      const apiResult = await fetchFromApi(t)

      if (apiResult) {
        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: apiResult.answer,
          source: apiResult.source,
        }
        setMessages((prev) => [...prev, assistantMsg])
      } else {
        // Fallback: local RAG
        const match = findBestMatch(t, knowledge)
        if (match) {
          const assistantMsg: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: match.answer,
            source: match.source,
          }
          setMessages((prev) => [...prev, assistantMsg])
        } else {
          const assistantMsg: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content:
              "Je suis désolé, je n'ai pas trouvé de réponse dans ma base de connaissance. Posez votre question différemment ou consultez la documentation officielle LYRA.",
          }
          setMessages((prev) => [...prev, assistantMsg])
        }
      }

      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    },
    [isLoading, knowledge],
  )

  // ── Handle Enter ─────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  // ── Suggestion click ─────────────────────────────────────────────────
  const handleSuggestion = (suggestion: string) => {
    sendMessage(suggestion)
  }

  // ── Typing indicator ─────────────────────────────────────────────────
  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-1 px-4 py-3 rounded-2xl bg-white/5"
      style={{ maxWidth: '80%' }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-amber-400"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.div>
  )

  // ── Bubble ───────────────────────────────────────────────────────────
  const MessageBubble = ({ msg }: { msg: Message }) => {
    const isUser = msg.role === 'user'
    return (
      <motion.div
        initial={{ opacity: 0, x: isUser ? 40 : -40, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
      >
        <div
          className={`px-4 py-3 rounded-2xl max-w-[80%] leading-relaxed ${
            isUser
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-br-md'
              : 'bg-white/10 text-white/90 backdrop-blur-md rounded-bl-md border border-white/10'
          }`}
        >
          <p className="text-sm md:text-base whitespace-pre-wrap">{msg.content}</p>
          {msg.source && !isUser && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-2 text-xs text-amber-300/70 italic border-t border-white/10 pt-2"
            >
              Source: {msg.source}
            </motion.p>
          )}
        </div>
      </motion.div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-slate-900 flex flex-col">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-400/3 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 px-4 pt-6 pb-3 text-center"
      >
        <motion.div
          className="inline-block"
          whileHover={{ scale: 1.02 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
            🤖 Chat LYRA Intelligent
          </h1>
        </motion.div>
        <p className="text-sm text-white/50 mt-1 max-w-xl mx-auto">
          Posez vos questions sur la comptabilité LYRA, la fiscalité ivoirienne, la paie &amp; CNPS
        </p>
        {/* Plan guard banner for Starter */}
        {planCode === 'starter' && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-4 mx-auto max-w-xl px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left"
          >
            <p className="text-sm text-amber-300">
              Chat LYRA limité aux questions fréquentes. Passez au plan Business pour l'accès complet.
            </p>
            <Link href="/pricing">
              <span className="text-xs text-amber-400 hover:underline mt-1 inline-block">Voir les offres →</span>
            </Link>
          </motion.div>
        )}
      </motion.header>

      {/* Messages area */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col items-center justify-center h-full text-center text-white/30"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl mb-4"
            >
              💬
            </motion.div>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {isLoading && <TypingIndicator />}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      <AnimatePresence>
        {showSuggestions && messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative z-10 px-4 pb-2"
          >
            <p className="text-xs text-white/30 text-center mb-2 uppercase tracking-widest">
              Suggestions
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {(planCode === 'starter' ? SUGGESTIONS_STARTER : SUGGESTIONS_ALL).map((s, i) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(251,191,36,0.15)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSuggestion(s)}
                  className="px-4 py-2 text-sm rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur-sm transition-colors hover:border-amber-400/30 hover:text-amber-300"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative z-10 px-4 pb-6 pt-2"
      >
        <div className="max-w-2xl mx-auto relative">
          <div className="glass-panel flex items-center gap-2 p-1.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question LYRA..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-white/90 placeholder-white/30 px-4 py-2 outline-none text-sm"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-opacity shadow-lg shadow-amber-500/20"
            >
              {isLoading ? '...' : 'Envoyer'}
            </motion.button>
          </div>

          {/* Status indicator */}
          {ready && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center mt-2 text-[10px] text-white/20"
            >
              {knowledge.length} entrées en base • RAG local actif
            </motion.p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
