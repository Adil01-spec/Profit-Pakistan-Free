
'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from 'next/link';
import { createSafepaySession } from "@/app/actions/safepay";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function UpgradePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const plans = [
    {
      name: "Free Plan",
      price: "₨ 0 /month",
      highlight: "For quick access and testing basic features.",
      features: [
        "No login required — start instantly.",
        "Access to the basic AI assistant.",
        "Limited calculators (Profit, Expense & ROI only).",
        "Simple and clean UI with ads.",
        "Uses one default AI model.",
        "No chat memory or data saving."
      ],
      buttonText: "Current Plan",
      disabled: true,
      border: "border-gray-300 dark:border-gray-700",
      bg: "bg-gray-50 dark:bg-gray-900/50",
      text: "text-gray-800 dark:text-gray-200"
    },
    {
      name: "Pro Plan",
      price: "₨ 599 /month",
      highlight: "Unlock full AI + business insights at low cost.",
      features: [
        "Full access to all premium features.",
        "Ad-free modern dashboard & dark mode.",
        "Unlocks three AI models: LLaMA, Gemini, and ChatGPT.",
        "Smart auto-model selection for better accuracy & speed.",
        "Includes all advanced calculators.",
        "Content Generator (posts, captions, titles).",
        "Fast responses, longer chat memory, and personalized insights.",
        "Priority support and early access to new tools.",
      ],
      buttonText: "Proceed to Payment",
      disabled: false,
      border: "border-yellow-400 dark:border-yellow-500 shadow-yellow-500/20",
      bg: "bg-yellow-50 dark:bg-yellow-950/40",
      text: "text-yellow-800 dark:text-yellow-200"
    }
  ];

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const result = await createSafepaySession(599);
      if (result.error) {
        throw new Error(result.error);
      }
      if (result.redirectUrl) {
        // Redirect the user to the Safepay checkout page
        router.push(result.redirectUrl);
      } else {
        throw new Error("Could not get checkout URL.");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "⚠️ Payment Error",
        description: error.message || "Could not initiate payment. Please try again.",
      });
      setIsLoading(false);
    }
  };

  function UpgradeHeader() {
    return (
      <div className="absolute top-6 left-6 flex items-center gap-2 mb-4">
        <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 bg-background text-foreground transition-colors duration-300 font-sans relative">
       <UpgradeHeader />
      <h1 className="text-3xl font-bold text-center mb-2 mt-8 sm:mt-0">Choose Your Plan 🚀</h1>
      <p className="text-center text-muted-foreground mb-10">
        Scale your business with AI-powered insights — choose the plan that fits you best.
      </p>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto">
        {plans.map((plan, i) => (
          <div
            key={i}
            className={`flex flex-col justify-between border rounded-2xl shadow-lg p-6 transition-all duration-300 transform hover:-translate-y-1 ${plan.border} ${plan.bg} ${plan.text}`}
          >
            <div>
              <h2 className="text-2xl font-semibold mb-2">{plan.name}</h2>
              <p className="text-3xl font-bold mb-2">{plan.price}</p>
              <p className="text-sm opacity-90 mb-6">{plan.highlight}</p>
              <ul className="space-y-3 mb-6 text-sm">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start">
                    <span className="text-yellow-500 mr-3 mt-1">✔</span> {f}
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={() => {
                if (!plan.disabled) {
                  handleUpgrade();
                }
              }}
              disabled={plan.disabled || isLoading}
              className={`w-full mt-4 py-3 rounded-xl font-medium transition-colors ${
                plan.disabled
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-400 dark:hover:bg-yellow-300 dark:text-black'
              }`}
            >
              {isLoading && !plan.disabled && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading && !plan.disabled ? 'Redirecting...' : plan.buttonText}
            </Button>
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-muted-foreground mt-8">
        *Payments are processed securely via Safepay. You’ll receive confirmation via email after successful activation.
      </p>
    </div>
  );
}
