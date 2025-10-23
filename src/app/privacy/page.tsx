
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold md:text-3xl">
            Privacy Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            This is a placeholder for your Privacy Policy.
          </p>
          <p>
            Your privacy is important to us. It is Profit Pakistan (Free)'s policy to respect your privacy regarding any information we may collect from you across our website, and other sites we own and operate.
          </p>
           <p>
            We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
