import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In - Carve',
  description: 'Access your Carve account',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-white">
      {children}
    </div>
  )
}
