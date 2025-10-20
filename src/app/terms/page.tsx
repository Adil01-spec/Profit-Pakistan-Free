
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold md:text-3xl">
            Terms of Service
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
            <p>
                This is a placeholder for your Terms of Service.
            </p>
            <p>
                By accessing the website at Profit Pakistan Pro, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
            </p>
            <p>
                Permission is granted to temporarily download one copy of the materials (information or software) on Profit Pakistan Pro's website for personal, non-commercial transitory viewing only.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
