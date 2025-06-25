// 服务条款页面
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl font-bold text-white mb-8 text-center">Terms of Service</h1>
          
          <div className="prose prose-invert max-w-none text-gray-200 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction and Acceptance of Terms</h2>
              <p>Welcome to CatMe, a creative mini-app that generates AI cat images based on your personality. By accessing or using our service, you agree that you have read, understood, and accepted these Terms of Service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Use of the Service</h2>
              <p>CatMe provides an AI-based image generation service. After registration and login, users can generate personalized cat avatars based on personality inputs. The service includes free trials and subscription-based paid features. You agree to comply with all applicable local, national, and international laws.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts and Access</h2>
              <div className="space-y-4">
                <div>
                  <strong>Registration Required:</strong> You must register and log in to use CatMe. You must provide accurate and truthful information.
                </div>
                <div>
                  <strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials. All activities under your account are your responsibility.
                </div>
                <div>
                  <strong>Abuse Handling:</strong> You must notify us immediately of any unauthorized access or use.
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Generated Content and Intellectual Property</h2>
              <div className="space-y-4">
                <div>
                  <strong>Image Ownership:</strong> You own the rights to the cat images you generate with CatMe. You may use them for personal or commercial purposes.
                </div>
                <div>
                  <strong>Technology Ownership:</strong> The underlying technology, interface, and platform are the property of CatMe and may not be copied or used commercially without permission.
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Prohibited Activities</h2>
              <p className="mb-4">You may not use CatMe to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Generate illegal, abusive, harassing, pornographic, hateful, or misleading content</li>
                <li>Impersonate others or create deceptive content (e.g., deepfakes)</li>
                <li>Abuse or attempt to bypass the platform's security measures</li>
                <li>Use bots, scripts, or crawlers to access or overload the service</li>
                <li>Infringe on the rights of others or CatMe's intellectual property</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Privacy and Data Collection</h2>
              <p className="mb-4">CatMe collects:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Registration data (email, login behavior)</li>
                <li>Usage data (image generation logs, activity timestamps)</li>
                <li>Text prompts you enter (used only for image generation, not stored long-term)</li>
                <li>Cookies & local storage data for login state and UI optimization</li>
              </ul>
              <p className="mt-4">We do not retain your input or generated images after processing, unless you choose to save them to your account. Please refer to our Privacy Policy for full details.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Service Availability and Pricing</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>This service is provided "as is." We do not guarantee uninterrupted or error-free operation.</li>
                <li>We reserve the right to introduce premium features or limit usage of the free tier in the future.</li>
                <li>All paid services will be clearly marked before purchase. Users may choose to subscribe at their discretion.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Termination and Restrictions</h2>
              <p>If we determine that you have violated these terms or engaged in harmful behavior, we may suspend or terminate your access to CatMe without prior notice.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Disclaimer and Limitation of Liability</h2>
              <p>To the fullest extent permitted by law, CatMe shall not be liable for any direct or indirect damages resulting from your use of the service. Your use is at your own risk.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Governing Law and Dispute Resolution</h2>
              <p>These Terms shall be governed by the laws of the jurisdiction in which CatMe operates. Disputes shall be resolved through negotiation, or if unsuccessful, through arbitration in the jurisdiction of CatMe.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to These Terms</h2>
              <p>We may update these Terms at any time. Changes will be posted on our website. Continued use of the service constitutes your acceptance of the updated Terms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Information</h2>
              <p className="mb-4">If you have any questions, please contact us:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Email: <a href="mailto:zz0139296@gmail.com" className="text-purple-300 hover:text-white">zz0139296@gmail.com</a></li>
                <li>Website: <a href="https://catme.app" className="text-purple-300 hover:text-white">https://catme.app</a></li>
              </ul>
              <p className="mt-6 font-semibold">By using CatMe, you confirm that you have read and accepted these Terms of Service.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
} 