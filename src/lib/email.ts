import { Resend } from 'resend'

const fromEmail = 'contact@vivalyscompagny.com'

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

function buildVerificationHtml(code: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vérification de votre email</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0b0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0b0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img src="https://lyra.vivalyscompagny.com/img/coris.png" alt="Coris" width="120" style="display:block;border:0;" />
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background:linear-gradient(135deg,rgba(255,255,255,0.03) 0%,rgba(255,255,255,0.01) 100%);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:40px 32px;position:relative;">
              <!-- Gold accent top border -->
              <div style="position:absolute;top:0;left:32px;right:32px;height:1px;background:linear-gradient(90deg,transparent,rgba(201,169,97,0.5),transparent);"></div>

              <h1 style="color:#f5f0e8;font-size:22px;font-weight:700;margin:0 0 8px 0;text-align:center;letter-spacing:-0.3px;">
                Vérification de votre email
              </h1>
              <p style="color:rgba(245,240,232,0.5);font-size:14px;margin:0 0 28px 0;text-align:center;line-height:1.6;">
                Bienvenue sur <strong style="color:rgba(201,169,97,0.8);font-weight:600;">LYRA</strong> — Votre ERP LYRA
              </p>

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

              <!-- Divider -->
              <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent);margin-bottom:24px;"></div>

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

function buildResetPasswordHtml(code: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation de mot de passe</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0b0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0b0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img src="https://lyra.vivalyscompagny.com/img/coris.png" alt="Coris" width="120" style="display:block;border:0;" />
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background:linear-gradient(135deg,rgba(255,255,255,0.03) 0%,rgba(255,255,255,0.01) 100%);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:40px 32px;position:relative;">
              <!-- Gold accent top border -->
              <div style="position:absolute;top:0;left:32px;right:32px;height:1px;background:linear-gradient(90deg,transparent,rgba(201,169,97,0.5),transparent);"></div>

              <h1 style="color:#f5f0e8;font-size:22px;font-weight:700;margin:0 0 8px 0;text-align:center;letter-spacing:-0.3px;">
                Réinitialisation de mot de passe
              </h1>
              <p style="color:rgba(245,240,232,0.5);font-size:14px;margin:0 0 28px 0;text-align:center;line-height:1.6;">
                <strong style="color:rgba(201,169,97,0.8);font-weight:600;">LYRA</strong> — Votre ERP LYRA
              </p>

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

              <!-- Divider -->
              <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent);margin-bottom:24px;"></div>

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
