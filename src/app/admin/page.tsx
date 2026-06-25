'use client'
import { motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import AppShell from '@/components/layout/AppShell'

type Subscription = {
  id: string
  companyId: string
  planId: string
  status: string
  paymentPeriod: string
  startDate: string
  endDate: string
  createdAt: string
  company: {
    id: string
    name: string
    email: string
  }
  plan: {
    id: string
    name: string
    code: string
    priceMonthly: number
    priceYearly: number
  }
}

const STATUS_LABELS: Record<string, string> = {
  trial: 'Essai',
  pending_payment: 'En attente',
  paid: 'Payé',
  active: 'Actif',
  suspended: 'Suspendu',
  expired: 'Expiré',
}

const STATUS_COLORS: Record<string, string> = {
  trial: '#f0ad4e',
  pending_payment: '#d9534f',
  paid: '#5bc0de',
  active: '#5cb85c',
  suspended: '#888',
  expired: '#999',
}

export default function AdminSpace() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [statusChanges, setStatusChanges] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/subscriptions')
      const json = await res.json()
      if (res.ok) {
        setSubscriptions(json.data || [])
      } else {
        setError(json.error || 'Erreur lors du chargement')
      }
    } catch (e) {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  const handleStatusChange = (subId: string, newStatus: string) => {
    setStatusChanges(prev => ({ ...prev, [subId]: newStatus }))
  }

  const handleValidatePayment = async (sub: Subscription) => {
    const newStatus = statusChanges[sub.id]
    if (!newStatus || newStatus === sub.status) return

    setUpdatingId(sub.id)
    setError(null)

    try {
      const res = await fetch('/api/admin/subscription/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: sub.id, status: newStatus }),
      })

      const json = await res.json()

      if (res.ok) {
        setStatusChanges(prev => {
          const next = { ...prev }
          delete next[sub.id]
          return next
        })
        await fetchSubscriptions()
      } else {
        setError(json.error || 'Erreur lors de la mise à jour')
      }
    } catch (e) {
      setError('Erreur réseau lors de la mise à jour')
    } finally {
      setUpdatingId(null)
    }
  }

  const getPrice = (sub: Subscription): number => {
    if (sub.paymentPeriod === 'yearly') return sub.plan.priceYearly
    return sub.plan.priceMonthly
  }

  const getNextStatuses = (currentStatus: string): string[] => {
    const flow: Record<string, string[]> = {
      pending_payment: ['paid', 'active', 'suspended'],
      paid: ['active', 'suspended'],
      trial: ['pending_payment', 'active', 'paid', 'suspended'],
      active: ['suspended'],
      suspended: ['active'],
      expired: ['active'],
    }
    return flow[currentStatus] || ['active', 'suspended']
  }

  const formatDate = (d: string) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <AppShell>
      <main style={{ minHeight: '100vh', background: '#0a0f0a', color: '#fff', fontFamily: 'sans-serif', padding: 24 }}>
        {/* Logo + Titre */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
          <motion.img
            src="/img/coris.png"
            alt="Coris"
            style={{ width: 80, height: 'auto' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
          <div>
            <h1 style={{ fontSize: 28, color: '#d4af37', marginBottom: 4 }}>🛡️ Espace Administrateur</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Panneau de contrôle LYRA by Vivalys</p>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div style={{
            background: 'rgba(217,83,79,0.15)',
            border: '1px solid #d9534f',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 24,
            color: '#d9534f',
            fontSize: 14,
            maxWidth: 900,
            margin: '0 auto 24px auto',
          }}>
            ❌ {error}
          </div>
        )}

        {/* Section Demandes de souscription */}
        <section style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(212,175,55,0.15)',
          borderRadius: 16,
          padding: 24,
          maxWidth: 1100,
          margin: '0 auto',
        }}>
          <h2 style={{ fontSize: 20, color: '#d4af37', marginBottom: 20 }}>
            📋 Demandes de souscription
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 48, color: 'rgba(255,255,255,0.4)' }}>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Chargement des souscriptions...
              </motion.div>
            </div>
          ) : subscriptions.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 32 }}>
              Aucune souscription pour le moment.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                    <TH>Société</TH>
                    <TH>Plan</TH>
                    <TH>Montant</TH>
                    <TH>Période</TH>
                    <TH>Statut</TH>
                    <TH>Début</TH>
                    <TH>Fin</TH>
                    <TH>Action</TH>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => {
                    const selectedStatus = statusChanges[sub.id] || sub.status
                    const hasChanged = statusChanges[sub.id] && statusChanges[sub.id] !== sub.status
                    const isUpdating = updatingId === sub.id

                    return (
                      <tr
                        key={sub.id}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <TD>
                          <div style={{ fontWeight: 600, color: '#f5f0e8' }}>{sub.company.name}</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{sub.company.email}</div>
                        </TD>
                        <TD>
                          <span style={{
                            background: 'rgba(212,175,55,0.1)',
                            color: '#d4af37',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: 12,
                          }}>
                            {sub.plan.name}
                          </span>
                        </TD>
                        <TD>
                          <span style={{ fontWeight: 600, color: '#f5f0e8' }}>
                            {getPrice(sub).toLocaleString('fr-FR')} FCFA
                          </span>
                        </TD>
                        <TD>
                          <span style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>
                            {sub.paymentPeriod === 'yearly' ? 'Annuel' : 'Mensuel'}
                          </span>
                        </TD>
                        <TD>
                          <span style={{
                            display: 'inline-block',
                            background: `${STATUS_COLORS[sub.status] || '#666'}22`,
                            color: STATUS_COLORS[sub.status] || '#ccc',
                            padding: '2px 10px',
                            borderRadius: 10,
                            fontSize: 11,
                            fontWeight: 600,
                            border: `1px solid ${STATUS_COLORS[sub.status] || '#666'}44`,
                          }}>
                            {STATUS_LABELS[sub.status] || sub.status}
                          </span>
                        </TD>
                        <TD style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{formatDate(sub.startDate)}</TD>
                        <TD style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{formatDate(sub.endDate)}</TD>
                        <TD>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <select
                              value={selectedStatus}
                              onChange={(e) => handleStatusChange(sub.id, e.target.value)}
                              disabled={isUpdating}
                              style={{
                                background: '#1a1f1a',
                                color: '#f5f0e8',
                                border: `1px solid ${hasChanged ? '#d4af37' : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: 6,
                                padding: '4px 8px',
                                fontSize: 12,
                                cursor: 'pointer',
                                outline: 'none',
                              }}
                            >
                              <option value={sub.status} disabled>
                                {STATUS_LABELS[sub.status] || sub.status}
                              </option>
                              {getNextStatuses(sub.status).map((st) => (
                                <option key={st} value={st}>
                                  {STATUS_LABELS[st] || st}
                                </option>
                              ))}
                            </select>

                            {hasChanged && (
                              <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => handleValidatePayment(sub)}
                                disabled={isUpdating}
                                style={{
                                  background: isUpdating ? 'rgba(212,175,55,0.3)' : '#d4af37',
                                  color: '#0a0f0a',
                                  border: 'none',
                                  borderRadius: 6,
                                  padding: '4px 12px',
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: isUpdating ? 'not-allowed' : 'pointer',
                                  whiteSpace: 'nowrap',
                                }}
                                whileHover={!isUpdating ? { scale: 1.05 } : {}}
                                whileTap={!isUpdating ? { scale: 0.95 } : {}}
                              >
                                {isUpdating ? (
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <motion.span
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                      style={{ display: 'inline-block' }}
                                    >
                                      ↻
                                    </motion.span>
                                    Mise à jour...
                                  </span>
                                ) : (
                                  'Valider ✓'
                                )}
                              </motion.button>
                            )}
                          </div>
                        </TD>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Cartes de navigation */}
        <div style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: 600,
          margin: '40px auto 0',
        }}>
          <Card title="👥 Utilisateurs" desc="Gérer les comptes" />
          <Card title="📊 Abonnements" desc="Plans et souscriptions" />
          <Card title="📦 Société" desc="Configurer l'entreprise" />
          <Card title="🔐 Sécurité" desc="Logs et permissions" />
          <Card title="📧 Emails" desc="Resend & notifications" />
          <Card title="⚙️ Système" desc="Base de données & logs" />
        </div>

        {/* Identifiants admin */}
        <div style={{
          marginTop: 48,
          padding: '24px 32px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: 16,
          maxWidth: 400,
          margin: '48px auto 0',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 8 }}>IDENTIFIANTS ADMIN</p>
          <p style={{ color: '#d4af37', fontSize: 14 }}>📧 admin@lyra.ci</p>
          <p style={{ color: '#d4af37', fontSize: 14 }}>🔑 admin123</p>
        </div>
      </main>
    </AppShell>
  )
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <motion.div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: '20px 24px',
        width: 200,
        cursor: 'pointer',
      }}
      whileHover={{ y: -4, borderColor: 'rgba(212,175,55,0.3)' }}
      whileTap={{ scale: 0.97 }}
    >
      <h3 style={{ fontSize: 16, color: '#f5f0e8', marginBottom: 4 }}>{title}</h3>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
    </motion.div>
  )
}

function TH({ children }: { children: React.ReactNode }) {
  return (
    <th style={{
      padding: '10px 12px',
      textAlign: 'left',
      color: 'rgba(255,255,255,0.5)',
      fontWeight: 600,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    }}>
      {children}
    </th>
  )
}

function TD({ children }: { children: React.ReactNode }) {
  return (
    <td style={{ padding: '12px 12px', verticalAlign: 'middle' }}>
      {children}
    </td>
  )
}
