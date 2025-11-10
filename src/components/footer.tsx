
"use client";
import { FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="w-full border-t mt-8 py-6 bg-background text-foreground transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 px-4">
        <p className="text-sm text-center md:text-left">
          © {new Date().getFullYear()} Profit Pakistan — All rights reserved.
        </p>

        <div className="flex items-center gap-5 text-lg">
          <a
            href="https://www.linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="hover:text-primary transition-colors"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:text-primary transition-colors"
          >
            <FaInstagram />
          </a>
          <a
            href="https://www.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="hover:text-primary transition-colors"
          >
            <FaYoutube />
          </a>
        </div>
      </div>
    </footer>
  );
}
