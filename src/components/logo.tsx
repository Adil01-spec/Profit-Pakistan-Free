import { cn } from "@/lib/utils";

export const Logo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("h-12 w-12 text-primary", className)}
    {...props}
  >
    <path d="M8 8a4 4 0 1 1 8 0" />
    <path d="M8 12h8" />
    <path d="M8 16h8" />
    <path d="M14.5 20.5 12 23l-2.5-2.5" />
    <path d="M12 2v21" />
  </svg>
);
