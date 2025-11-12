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
    <div className="h-screen max-h-screen overflow-hidden bg-[#ececf1]">
      {children}
    </div>
  )
}
