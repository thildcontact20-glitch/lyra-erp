import { Resend } from 'resend'

const fromEmail = 'LYRA <contact@lyra.vivalyscompagny.com>'

let resendInstance: Resend | null = null

function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not set')
    }
    resendInstance = new Resend(apiKey)
  }
  return resendInstance
}

// ──────────────────────────────────────
// Shared email shell (dark/gold LYRA branding)
// ──────────────────────────────────────

function emailShell(title: string, subtitle: string, bodyContent: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0b0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0b0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img src="https://lyra.vivalyscompagny.com/img/coris.png" alt="LYRA" width="120" style="display:block;border:0;" />
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background:linear-gradient(135deg,rgba(255,255,255,0.03) 0%,rgba(255,255,255,0.01) 100%);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:40px 32px;position:relative;">
              <!-- Gold accent top border -->
              <div style="position:absolute;top:0;left:32px;right:32px;height:1px;background:linear-gradient(90deg,transparent,rgba(201,169,97,0.5),transparent);"></div>

              <h1 style="color:#f5f0e8;font-size:22px;font-weight:700;margin:0 0 8px 0;text-align:center;letter-spacing:-0.3px;">
                ${title}
              </h1>
              <p style="color:rgba(245,240,232,0.5);font-size:14px;margin:0 0 28px 0;text-align:center;line-height:1.6;">
                ${subtitle}
              </p>

              ${bodyContent}

              <!-- Divider -->
              <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent);margin:24px 0;"></div>

              <p style="color:rgba(245,240,232,0.25);font-size:11px;margin:0;text-align:center;">
                LYRA by Vivalys — ERP LYRA
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ──────────────────────────────────────
// Builder helpers
// ──────────────────────────────────────

function buildVerificationHtml(code: string): string {
  return emailShell(
    'Vérification de votre email',
    'Bienvenue sur <strong style="color:rgba(201,169,97,0.8);font-weight:600;">LYRA</strong> — Votre ERP LYRA',
    `
      <p style="color:rgba(245,240,232,0.7);font-size:14px;margin:0 0 4px 0;line-height:1.6;">
        Bonjour,
      </p>
      <p style="color:rgba(245,240,232,0.6);font-size:14px;margin:0 0 24px 0;line-height:1.6;">
        Voici votre code de vérification à 6 chiffres :
      </p>

      <!-- Code -->
      <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px auto;">
        <tr>
          <td style="background:rgba(255,255,255,0.05);border:1px solid rgba(201,169,97,0.3);border-radius:12px;padding:16px 32px;text-align:center;">
            <span style="color:#c9a961;font-size:36px;font-weight:700;letter-spacing:8px;font-family:'Courier New',Courier,monospace;">${code}</span>
          </td>
        </tr>
      </table>

      <p style="color:rgba(245,240,232,0.4);font-size:12px;margin:0 0 24px 0;text-align:center;line-height:1.6;">
        Ce code expire dans 1 heure. Si vous n'avez pas demandé cette vérification, ignorez cet email.
      </p>
    `
  )
}

function buildWelcomeHtml(name: string): string {
  return emailShell(
    'Bienvenue sur LYRA',
    'Votre email a été vérifié avec succès',
    `
      <p style="color:rgba(245,240,232,0.7);font-size:14px;margin:0 0 4px 0;line-height:1.6;">
        Bonjour ${name},
      </p>
      <p style="color:rgba(245,240,232,0.6);font-size:14px;margin:0 0 24px 0;line-height:1.6;">
        Nous sommes ravis de vous accueillir sur <strong style="color:rgba(201,169,97,0.8);">LYRA</strong>, votre solution ERP nouvelle génération.
      </p>

      <p style="color:rgba(245,240,232,0.6);font-size:14px;margin:0 0 8px 0;line-height:1.6;">
        Vous pouvez dès maintenant :
      </p>

      <ul style="color:rgba(245,240,232,0.6);font-size:14px;margin:0 0 28px 0;padding-left:20px;line-height:1.8;">
        <li>Accéder à votre tableau de bord</li>
        <li>Configurer votre profil et votre société</li>
        <li>Explorer les modules de gestion</li>
      </ul>

      <!-- CTA Button -->
      <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px auto;">
        <tr>
          <td style="background:#c9a961;border-radius:8px;padding:12px 28px;text-align:center;">
            <a href="https://lyra.vivalyscompagny.com/login" style="color:#0b0b0f;font-size:14px;font-weight:600;text-decoration:none;display:inline-block;">
              Se connecter
            </a>
          </td>
        </tr>
      </table>
    `
  )
}

function buildResetPasswordHtml(code: string): string {
  return emailShell(
    'Réinitialisation de mot de passe',
    '<strong style="color:rgba(201,169,97,0.8);font-weight:600;">LYRA</strong> — Votre ERP LYRA',
    `
      <p style="color:rgba(245,240,232,0.7);font-size:14px;margin:0 0 4px 0;line-height:1.6;">
        Bonjour,
      </p>
      <p style="color:rgba(245,240,232,0.6);font-size:14px;margin:0 0 24px 0;line-height:1.6;">
        Vous avez demandé la réinitialisation de votre mot de passe. Voici votre code de confirmation :
      </p>

      <!-- Code -->
      <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px auto;">
        <tr>
          <td style="background:rgba(255,255,255,0.05);border:1px solid rgba(201,169,97,0.3);border-radius:12px;padding:16px 32px;text-align:center;">
            <span style="color:#c9a961;font-size:36px;font-weight:700;letter-spacing:8px;font-family:'Courier New',Courier,monospace;">${code}</span>
          </td>
        </tr>
      </table>

      <p style="color:rgba(245,240,232,0.4);font-size:12px;margin:0 0 24px 0;text-align:center;line-height:1.6;">
        Ce code expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
      </p>
    `
  )
}

function buildPaymentConfirmationHtml(planName: string, amount?: string, period?: string): string {
  return emailShell(
    'Paiement confirmé',
    'Merci pour votre souscription',
    `
      <p style="color:rgba(245,240,232,0.7);font-size:14px;margin:0 0 4px 0;line-height:1.6;">
        Bonjour,
      </p>
      <p style="color:rgba(245,240,232,0.6);font-size:14px;margin:0 0 24px 0;line-height:1.6;">
        Votre paiement pour le plan <strong style="color:rgba(201,169,97,0.8);">${planName}</strong> a été confirmé avec succès.
      </p>

      <!-- Plan details card -->
      <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px auto;width:100%;">
        <tr>
          <td style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:rgba(245,240,232,0.4);font-size:12px;padding-bottom:8px;">Plan</td>
                <td style="color:#f5f0e8;font-size:14px;font-weight:600;text-align:right;padding-bottom:8px;">${planName}</td>
              </tr>
              ${amount ? `
              <tr>
                <td style="color:rgba(245,240,232,0.4);font-size:12px;padding-bottom:8px;">Montant</td>
                <td style="color:#f5f0e8;font-size:14px;font-weight:600;text-align:right;padding-bottom:8px;">${amount}</td>
              </tr>
              ` : ''}
              ${period ? `
              <tr>
                <td style="color:rgba(245,240,232,0.4);font-size:12px;">Période</td>
                <td style="color:#f5f0e8;font-size:14px;font-weight:600;text-align:right;">${period}</td>
              </tr>
              ` : ''}
            </table>
          </td>
        </tr>
      </table>

      <p style="color:rgba(245,240,232,0.5);font-size:13px;margin:0 0 28px 0;text-align:center;line-height:1.6;">
        Un reçu détaillé vous sera envoyé séparément.
      </p>
    `
  )
}

function buildSubscriptionActivatedHtml(planName: string, companyName: string): string {
  return emailShell(
    'Abonnement activé',
    'Votre plan est maintenant actif',
    `
      <p style="color:rgba(245,240,232,0.7);font-size:14px;margin:0 0 4px 0;line-height:1.6;">
        Bonjour,
      </p>
      <p style="color:rgba(245,240,232,0.6);font-size:14px;margin:0 0 24px 0;line-height:1.6;">
        L'abonnement <strong style="color:rgba(201,169,97,0.8);">${planName}</strong> a été activé pour <strong style="color:#f5f0e8;">${companyName}</strong>.
      </p>

      <!-- Activation check -->
      <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px auto;">
        <tr>
          <td align="center" style="padding-bottom:16px;">
            <span style="display:inline-block;width:48px;height:48px;border-radius:50%;background:rgba(46,204,113,0.15);border:1px solid rgba(46,204,113,0.3);line-height:48px;font-size:24px;text-align:center;">✓</span>
          </td>
        </tr>
        <tr>
          <td align="center">
            <span style="color:rgba(46,204,113,0.8);font-size:14px;font-weight:600;">Actif</span>
          </td>
        </tr>
      </table>

      <p style="color:rgba(245,240,232,0.5);font-size:13px;margin:0 0 28px 0;text-align:center;line-height:1.6;">
        Vous pouvez dès à présent profiter de toutes les fonctionnalités incluses dans votre plan.
      </p>

      <!-- CTA Button -->
      <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px auto;">
        <tr>
          <td style="background:#c9a961;border-radius:8px;padding:12px 28px;text-align:center;">
            <a href="https://lyra.vivalyscompagny.com/dashboard" style="color:#0b0b0f;font-size:14px;font-weight:600;text-decoration:none;display:inline-block;">
              Accéder au tableau de bord
            </a>
          </td>
        </tr>
      </table>
    `
  )
}

// ──────────────────────────────────────
// Public send functions
// ──────────────────────────────────────

export async function sendVerificationEmail(email: string, code: string) {
  try {
    const resend = getResend()
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'LYRA — Vérification de votre email',
      html: buildVerificationHtml(code),
    })
  } catch (error) {
    console.error('sendVerificationEmail error:', (error as Error).message)
    // Best-effort: don't throw
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const resend = getResend()
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'LYRA — Bienvenue sur LYRA',
      html: buildWelcomeHtml(name),
    })
  } catch (error) {
    console.error('sendWelcomeEmail error:', (error as Error).message)
    // Best-effort: don't throw
  }
}

export async function sendResetPasswordEmail(email: string, code: string) {
  try {
    const resend = getResend()
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'LYRA — Réinitialisation de mot de passe',
      html: buildResetPasswordHtml(code),
    })
  } catch (error) {
    console.error('sendResetPasswordEmail error:', (error as Error).message)
    // Best-effort: don't throw
  }
}

export async function sendPaymentConfirmationEmail(
  email: string,
  planName: string,
  amount?: string,
  period?: string,
) {
  try {
    const resend = getResend()
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `LYRA — Paiement confirmé - ${planName}`,
      html: buildPaymentConfirmationHtml(planName, amount, period),
    })
  } catch (error) {
    console.error('sendPaymentConfirmationEmail error:', (error as Error).message)
    // Best-effort: don't throw
  }
}

export async function sendSubscriptionActivatedEmail(
  email: string,
  planName: string,
  companyName: string,
) {
  try {
    const resend = getResend()
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `LYRA — Abonnement ${planName} activé`,
      html: buildSubscriptionActivatedHtml(planName, companyName),
    })
  } catch (error) {
    console.error('sendSubscriptionActivatedEmail error:', (error as Error).message)
    // Best-effort: don't throw
  }
}
