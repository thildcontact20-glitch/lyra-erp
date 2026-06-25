import { redirect } from 'next/navigation'

export default function LoginPage() {
  redirect('/api/auto-login')
  return null
}
