'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, ExternalLink } from "lucide-react"
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";


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

export default function UpgradePage() {
  const router = useRouter();
  const proAppUrl = "https://profit-pakistan-pro.vercel.app/login";

  return (
    <div className="min-h-screen px-6 py-12 bg-background text-foreground transition-colors duration-300 font-sans relative flex items-center justify-center">
       <UpgradeHeader />
      
      <Card className="max-w-lg mx-auto text-center">
        <CardHeader>
            <CardTitle className="text-2xl font-bold">Upgrade to Pro</CardTitle>
            <CardDescription>Unlock advanced features and take your business to the next level.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-muted-foreground">
                You will be redirected to the Profit Pakistan Pro application to complete your upgrade and log in.
            </p>
            <Button onClick={() => window.open(proAppUrl, '_blank')} size="lg" className="w-full">
                Go to Profit Pakistan Pro
                <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
        </CardContent>
        <CardFooter>
             <p className="text-xs text-muted-foreground text-center w-full">
                Note: The Pro version handles payments and account creation securely.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
