"use client"

import { Facebook, Twitter, Instagram, Github, Mail, Phone, MapPin, X } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* 公司信息 */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-1.5 mb-4">
              <img 
                src="/catme_logo.png" 
                alt="CatMe Logo" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">CatMe</span>
            </div>
            <p className="text-gray-400 mb-4">
              Your AI Cat Personality in a Picture.
            </p>
            {/* <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Github className="w-5 h-5" />
              </Link>
            </div> */}
          </div>

          {/* 产品链接 */}
          <div className="text-right">
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/gallery" className="text-gray-400 hover:text-white transition-colors">
                  Gallery
                </Link>
              </li>
              {/* <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  How to use
                </Link>
              </li> */}
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* 联系方式 */}
          <div className="text-right">
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-end text-gray-400">
                <span className="mr-2">zz0139296@gmail.com</span>
                <Mail className="w-4 h-4" />
              </li>
              <li className="flex items-center justify-end text-gray-400">
                <Link href="https://x.com/zack20250505" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors mr-2">
                  Follow us on X
                </Link>
                <X className="w-4 h-4" />
              </li>
              {/* <li className="flex items-center text-gray-400">
                <Phone className="w-4 h-4 mr-2" />
                400-123-4567
              </li>
              <li className="flex items-center text-gray-400">
                <MapPin className="w-4 h-4 mr-2" />
                Tech Park, Beijing, China
              </li> */}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2025 • Catme All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
            {/* <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Cookie Policy
            </Link> */}
          </div>
        </div>
      </div>
    </footer>
  )
} 