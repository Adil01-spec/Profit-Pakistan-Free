
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold md:text-3xl">
            Contact Us
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            This is a placeholder for your Contact page.
          </p>
          <p>
            If you have any questions or concerns, please feel free to reach out to us at <a href="mailto:support@profitpakistan.pro" className="text-primary hover:underline">support@profitpakistan.pro</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
