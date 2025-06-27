"use client"

import { X, Mail } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-900  border-gray-800 pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2025 • Catme All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link href="https://x.com/zack20250505" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors">
              <X className="w-5 h-5" />
            </Link>
            <Link href="mailto:zz0139296@gmail.com" className="text-gray-400 hover:text-purple-400 transition-colors">
              <Mail className="w-5 h-5" />
            </Link>
            <Link href="/privacy-policy" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
} 