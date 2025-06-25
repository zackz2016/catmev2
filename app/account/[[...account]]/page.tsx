// 账户管理页面 - 使用 Clerk 的 UserProfile 组件提供完整的用户管理功能
import { UserProfile } from '@clerk/nextjs'

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Account Management
          </h1>
          <div className="flex justify-center">
            <UserProfile 
              appearance={{
                elements: {
                  // 自定义样式以匹配应用主题
                  rootBox: "mx-auto",
                  card: "bg-white shadow-xl rounded-lg",
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 