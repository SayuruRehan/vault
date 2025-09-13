import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vault - Personal Developer Knowledge Base',
  description: 'A personal web app for capturing and organizing developer knowledge',
}

// NOTE: If you see a hydration warning about mismatched attributes on <body>,
// it is likely caused by a browser extension (e.g., Grammarly) injecting attributes
// before React hydrates. This warning is safe to ignore in development and will not
// affect most users in production. The <meta name="grammarly" content="false" /> tag
// below helps prevent Grammarly from injecting, but some extensions may still cause this.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="grammarly" content="false" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}