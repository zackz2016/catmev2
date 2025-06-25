// 隐私政策页面
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-purple-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
        
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">Privacy Policy</h1>
          
          <div className="prose prose-invert max-w-none text-gray-200 space-y-6">
            <p className="text-lg leading-relaxed">
              CatMe respects your privacy and is committed to protecting the information you share with us. 
              This Privacy Policy explains how we collect, use, store, and safeguard your personal data when you use our service.
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. What We Collect</h2>
              <p className="mb-4">We may collect the following data types:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Email, username, registration time</li>
                <li><strong>Usage Data:</strong> Frequency of usage, generation actions, user preferences</li>
                <li><strong>Device Info:</strong> Browser type, OS, IP address (used for abuse prevention and analytics)</li>
                <li><strong>User Inputs:</strong> Prompts used to generate images (not retained long-term)</li>
                <li><strong>Cookies & Local Storage:</strong> To maintain login state and improve experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use This Information</h2>
              <p className="mb-4">We use this data to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and improve our services</li>
                <li>Analyze usage patterns to enhance functionality and UI</li>
                <li>Ensure platform security and prevent abuse</li>
                <li>Save generation history for logged-in users</li>
                <li>Send important notifications or respond to user requests</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. What We Do Not Do</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>❌ We do not sell your personal data</li>
                <li>❌ We do not use your prompts for advertising or third parties</li>
                <li>❌ We do not store generation history unless you are logged in and choose to save</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Data Retention</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Prompts and images generated anonymously are not saved</li>
                <li>Logged-in users may choose to save their image history</li>
                <li>We regularly delete expired, inactive, or irrelevant data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Data Sharing</h2>
              <p className="mb-4">We may share data only under these circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To comply with legal obligations or court orders</li>
                <li>To prevent fraud, abuse, or security threats</li>
                <li>With service providers (e.g., hosting, analytics) under strict confidentiality agreements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data</li>
                <li>Request corrections or deletion</li>
                <li>Close your account or opt-out of the service</li>
                <li>Refuse data usage for analytics or personalization (if applicable)</li>
              </ul>
              <p className="mt-4">📧 You can contact us at <a href="mailto:zz0139296@gmail.com" className="text-purple-300 hover:text-white">zz0139296@gmail.com</a> to exercise your rights.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Data Security</h2>
              <p>We apply industry-standard encryption and access controls to protect your data. However, no online service can be completely secure.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Children's Privacy</h2>
              <p>CatMe is not intended for children under 13. If we discover a child has registered without parental consent, we will delete the account promptly.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. Significant changes will be notified via email or in-app messages.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Us</h2>
              <p className="mb-4">If you have any questions, feedback, or privacy requests, please contact us:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Email: <a href="mailto:zz0139296@gmail.com" className="text-purple-300 hover:text-white">zz0139296@gmail.com</a></li>
                <li>Website: <a href="https://catme.app" className="text-purple-300 hover:text-white">https://catme.app</a></li>
              </ul>
              <p className="mt-6 font-semibold">By using CatMe, you acknowledge and agree to this Privacy Policy.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
} 