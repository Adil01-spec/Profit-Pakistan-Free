
'use client'
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function UpgradePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-gray-50">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Upgrade to Premium 🌟</h1>
      <p className="text-gray-600 mb-6 text-center max-w-lg">
        Unlock advanced AI tools, detailed ad calculators, and unlimited insights to grow your business faster.
      </p>

      <div className="text-center mb-8 bg-white shadow-lg rounded-2xl p-6 border">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Premium Plan</h2>
        <p className="text-3xl font-bold text-yellow-600 mb-2">₨ 1,400 <span className="text-base text-gray-500 font-normal">/month</span></p>
        <p className="text-sm text-gray-500 mb-4">(≈ $5 USD/month)</p>
        <p className="text-gray-600 text-sm">
          Enjoy full access to AI insights, TikTok + Google Ad calculators, and detailed marketing tools.
        </p>
      </div>

      <table className="w-full max-w-md text-sm border mb-6 bg-white shadow rounded-xl">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">Feature</th>
            <th className="p-3 text-center">Free</th>
            <th className="p-3 text-center">Premium</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="p-3">Rewarded Ads</td><td className="text-center">✅</td><td className="text-center">❌</td></tr>
          <tr><td className="p-3">AI Chat Prompts</td><td className="text-center">3–5</td><td className="text-center">Unlimited</td></tr>
          <tr><td className="p-3">Google/TikTok Calculators</td><td className="text-center">❌</td><td className="text-center">✅</td></tr>
          <tr><td className="p-3">Business Insights</td><td className="text-center">✅</td><td className="text-center">✅</td></tr>
          <tr><td className="p-3">Priority Support</td><td className="text-center">❌</td><td className="text-center">✅</td></tr>
        </tbody>
      </table>

      <Button
        onClick={() => {
          alert('✅ Upgrade successful! Your premium access will be activated shortly.');
          router.push('/');
        }}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl shadow-lg transition"
      >
        Proceed to Payment
      </Button>

      <p className="text-xs text-gray-500 mt-4">
        *You’ll receive your Premium login credentials by email after payment confirmation.
      </p>
    </div>
  )
}
