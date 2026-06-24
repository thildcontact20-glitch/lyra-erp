import prisma from '../lib/prisma'

export interface FeatureCheck {
  allowed: boolean
  plan?: string
  requiredPlan?: string
  message?: string
  upgradeUrl?: string
}

// Définition des features requises par module
const FEATURE_MAP: Record<string, string> = {
  // Compta
  'compta-entries': 'compta_base',
  'compta-journals': 'compta_base',
  'compta-balance': 'compta_base',
  'compta-chart': 'compta_base',
  'compta-grand-livre': 'compta_complete',
  'compta-situation': 'compta_complete',
  // Commercial
  'commercial-clients': 'commercial_base',
  'commercial-invoices': 'commercial_base',
  'commercial-avoirs': 'commercial_full',
  'commercial-relances': 'commercial_full',
  // Stocks
  'stocks-items': 'stocks_base',
  'stocks-movements': 'stocks_advanced',
  'stocks-warehouses': 'stocks_advanced',
  'stocks-valuation': 'stocks_advanced',
  // Paie
  'payroll-employees': 'payroll',
  'payroll-payrolls': 'payroll',
  'payroll-cnps': 'payroll',
  // Fiscalité
  'tax-config': 'tax',
  'tax-declarations': 'tax',
  // États financiers
  'financial-basic': 'financial_basic',
  'financial-full': 'financial_full',
  'financial-tafire': 'financial_full',
  // Dashboard
  'dashboard': 'dashboard',
  'dashboard-premium': 'dashboard_premium',
  // Chat
  'chat-limited': 'chat_limited',
  'chat-full': 'chat_full',
  // Enterprise
  'multi-company': 'multi_company',
  'workflows': 'workflows',
  'advanced-roles': 'advanced_roles',
  'custom-reports': 'custom_reports',
  'support-priority': 'support_priority',
}

// Niveaux de plan pour comparaison
const PLAN_LEVEL: Record<string, number> = {
  'starter': 1, 'business': 2, 'enterprise': 3
}

// Features par plan (à synchroniser avec le seed)
const PLAN_FEATURES: Record<string, string[]> = {
  starter: ['compta_base', 'commercial_base', 'stocks_base', 'financial_basic', 'dashboard', 'chat_limited'],
  business: ['compta_complete', 'commercial_full', 'stocks_advanced', 'payroll', 'tax', 'financial_full', 'dashboard_premium', 'chat_full'],
  enterprise: ['compta_complete', 'commercial_full', 'stocks_advanced', 'payroll', 'tax', 'financial_full', 'dashboard_premium', 'chat_full', 'multi_company', 'workflows', 'advanced_roles', 'custom_reports', 'support_priority', 'on_premise'],
}

/**
 * Vérifie si la société a accès à une feature
 */
export async function checkFeature(companyId: string, featureKey: string): Promise<FeatureCheck> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { companyId },
      include: { plan: true },
    })

    if (!subscription || !subscription.plan) {
      return { allowed: false, message: 'Aucun abonnement actif', upgradeUrl: '/pricing' }
    }

    if (subscription.status !== 'active' && subscription.status !== 'trial') {
      return { allowed: false, message: 'Abonnement expiré ou annulé', upgradeUrl: '/pricing' }
    }

    const planCode = subscription.plan.code
    const requiredFeature = FEATURE_MAP[featureKey]

    if (!requiredFeature) {
      // Feature non mappée = accessible par tous
      return { allowed: true }
    }

    const planFeatures = PLAN_FEATURES[planCode] || []
    const hasFeature = planFeatures.includes(requiredFeature)

    if (!hasFeature) {
      const planLevel = PLAN_LEVEL[planCode] || 0
      let requiredPlan = 'Business'
      if (planLevel < 3) requiredPlan = 'Enterprise'
      if (!planFeatures.includes('compta_complete')) requiredPlan = 'Business'

      return {
        allowed: false,
        plan: subscription.plan.name,
        requiredPlan,
        message: `Cette fonctionnalité nécessite le plan ${requiredPlan}.`,
        upgradeUrl: '/pricing',
      }
    }

    return { allowed: true, plan: subscription.plan.name }
  } catch {
    return { allowed: true } // fallback: on laisse passer si erreur
  }
}

/**
 * Vérifie si la société peut créer un nouvel utilisateur
 */
export async function canAddUser(companyId: string): Promise<FeatureCheck> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { companyId },
      include: { plan: true, company: { include: { users: true } } },
    })
    if (!subscription || !subscription.plan) {
      return { allowed: false, message: 'Aucun abonnement actif' }
    }
    const currentUsers = subscription.company.users.length
    if (currentUsers >= subscription.plan.maxUsers) {
      return {
        allowed: false,
        message: `Limite de ${subscription.plan.maxUsers} utilisateurs atteinte. Passez au plan supérieur.`,
        upgradeUrl: '/pricing',
      }
    }
    return { allowed: true }
  } catch {
    return { allowed: true } // fallback DB indisponible
  }
}

/**
 * Vérifie si la société peut créer une nouvelle société (entité juridique)
 */
export async function canAddCompany(companyId: string, newCompanyCount: number = 1): Promise<FeatureCheck> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { companyId },
      include: { plan: true },
    })
    if (!subscription || !subscription.plan) {
      return { allowed: false, message: 'Aucun abonnement actif' }
    }
    if (newCompanyCount > subscription.plan.maxCompanies) {
      return {
        allowed: false,
        message: `Limite de ${subscription.plan.maxCompanies} société(s) atteinte. Passez au plan Enterprise.`,
        upgradeUrl: '/pricing',
      }
    }
    return { allowed: true }
  } catch {
    return { allowed: true } // fallback DB indisponible
  }
}

/**
 * Récupère l'abonnement actif d'une société
 */
export async function getActiveSubscription(companyId: string) {
  return prisma.subscription.findUnique({
    where: { companyId },
    include: { plan: true },
  })
}

export { PLAN_FEATURES, PLAN_LEVEL, FEATURE_MAP }
