import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Geist_Mono as GeistMono } from 'next/font/google'
import './globals.css'

const geistMono = GeistMono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Numerical Approximation | PNMuSI',
  description: 'Numerical methods for approximation and interpolation - PNMuSI Course',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistMono.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
