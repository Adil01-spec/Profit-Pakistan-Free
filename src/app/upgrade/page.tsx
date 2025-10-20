'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

export default function UpgradePage() {
  const router = useRouter();
  const { theme } = useTheme();

  const plans = [
    {
      name: "Free Plan",
      price: "₨ 0 /month",
      highlight: "Perfect for beginners exploring Profit Pakistan",
      features: [
        "Access to core calculators",
        "3 AI prompts per session",
        "Rewarded ads for extra chats",
        "Basic insights & reporting"
      ],
      buttonText: "Current Plan",
      disabled: true,
      border: "border-gray-300 dark:border-gray-700",
      bg: "bg-gray-50 dark:bg-gray-900",
      text: "text-gray-700 dark:text-gray-200"
    },
    {
      name: "Pro Plan",
      price: "₨ 1,400 /month",
      highlight: "Unlock full AI access + Ad calculators",
      features: [
        "Unlimited AI chat sessions",
        "Google & TikTok Ad Calculators",
        "Inventory Coverage Analysis",
        "Advanced business insights"
      ],
      buttonText: "Upgrade to Pro",
      border: "border-yellow-400 dark:border-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-950/40",
      text: "text-yellow-700 dark:text-yellow-300"
    },
    {
      name: "Business Plan",
      price: "₨ 3,500 /month",
      highlight: "Built for agencies & power users",
      features: [
        "All Pro features",
        "Team account access (up to 5 users)",
        "Priority customer support",
        "Exclusive campaign design tools"
      ],
      buttonText: "Upgrade to Business",
      border: "border-yellow-600 dark:border-yellow-500",
      bg: "bg-yellow-100 dark:bg-yellow-900/40",
      text: "text-yellow-800 dark:text-yellow-200"
    }
  ];

  return (
    <div className="min-h-screen px-6 py-12 bg-background text-foreground transition-colors duration-300 font-sans">
      <h1 className="text-3xl font-bold text-center mb-2">Choose Your Plan 🚀</h1>
      <p className="text-center text-muted-foreground mb-10">
        Scale your business with AI-powered insights — choose the plan that fits you best.
      </p>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto">
        {plans.map((plan, i) => (
          <div
            key={i}
            className={`flex flex-col justify-between border rounded-2xl shadow-sm p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${plan.border} ${plan.bg} ${plan.text}`}
          >
            <div>
              <h2 className="text-2xl font-semibold mb-2">{plan.name}</h2>
              <p className="text-3xl font-bold mb-2">{plan.price}</p>
              <p className="text-sm opacity-90 mb-4">{plan.highlight}</p>
              <ul className="space-y-2 mb-6 text-sm">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center">
                    <span className="text-yellow-500 mr-2">✔</span> {f}
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={() => {
                if (!plan.disabled) {
                  alert(`✅ You selected ${plan.name}. Payment flow coming soon!`);
                  router.push('/');
                }
              }}
              disabled={plan.disabled}
              className={`w-full mt-4 py-3 rounded-xl font-medium transition-colors ${
                plan.disabled
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-400 dark:hover:bg-yellow-300 dark:text-black'
              }`}
            >
              {plan.buttonText}
            </Button>
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-muted-foreground mt-8">
        *Payments are processed securely. You’ll receive confirmation via email after successful activation.
      </p>
    </div>
  );
}
