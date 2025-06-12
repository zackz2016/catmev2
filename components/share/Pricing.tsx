"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"

export function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Perfect Plan</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Flexible pricing options to meet different needs of individuals and businesses
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* 入门级 */}
          <Card className="bg-gray-800/50 border-gray-700 relative">
            <CardHeader>
              <CardTitle className="text-white text-xl">Starter</CardTitle>
              <CardDescription className="text-gray-400">Perfect for personal users and light usage</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold text-white">¥29</span>
                <span className="text-gray-400">/月</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-gray-300">100 images per month</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-gray-300">Basic style templates</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-gray-300">Standard resolution</span>
                </li>
                <li className="flex items-center">
                  <X className="w-5 h-5 text-gray-500 mr-3" />
                  <span className="text-gray-500">Commercial usage rights</span>
                </li>
              </ul>
              <Button className="w-full mt-6 bg-gray-700 hover:bg-gray-600">Choose Starter</Button>
            </CardContent>
          </Card>

          {/* 专业级 */}
          <Card className="bg-gradient-to-b from-purple-500/10 to-pink-500/10 border-purple-500/50 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Most Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-white text-xl">Professional</CardTitle>
              <CardDescription className="text-gray-400">
                Ideal for professional creators and small teams
              </CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold text-white">¥99</span>
                <span className="text-gray-400">/月</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-gray-300">500 images per month</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-gray-300">All style templates</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-gray-300">HD resolution</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-gray-300">Commercial usage rights</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-gray-300">Priority processing</span>
                </li>
              </ul>
              <Button className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                Choose Professional
              </Button>
            </CardContent>
          </Card>

          {/* 企业级 */}
          <Card className="bg-gray-800/50 border-gray-700 relative">
            <CardHeader>
              <CardTitle className="text-white text-xl">Enterprise</CardTitle>
              <CardDescription className="text-gray-400">
                Perfect for large teams and enterprise users
              </CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold text-white">¥299</span>
                <span className="text-gray-400">/月</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-gray-300">Unlimited image generation</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-gray-300">Custom style templates</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-gray-300">Ultra HD resolution</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-gray-300">Extended commercial rights</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-gray-300">Dedicated customer support</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-gray-300">API access</span>
                </li>
              </ul>
              <Button className="w-full mt-6 bg-gray-700 hover:bg-gray-600">Contact Sales</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
} 