
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/60 backdrop-blur-sm py-6 mt-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 text-sm text-muted-foreground">
        <p className="mb-2 md:mb-0">
          © {new Date().getFullYear()} Profit Pakistan. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-primary transition-colors">
            Terms
          </Link>
          <Link href="/contact" className="hover:text-primary transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
