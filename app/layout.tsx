import type { Metadata } from 'next'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from '@/components/ui/toaster'
import { Navbar } from '@/components/share/Navbar'
import { Footer } from '@/components/share/Footer'

export const metadata: Metadata = {
  title: 'CatMe - AI Cat Personality Generator',
  description: 'Generate unique cat images that match your personality with AI',
  generator: 'CatMe',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-900 text-white">
        <ClerkProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  )
}
