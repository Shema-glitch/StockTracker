import { Github, Heart, Mail, Twitter } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-around px-4">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Built with <Heart className="inline-block h-3 w-3 text-red-500 animate-pulse" /> by{" "}
            <a
              href="https://tristatelabs.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4 hover:text-primary"
            >
              TriState Labs
            </a>
            {" "}© {currentYear}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary">
            Terms
          </Link>
          <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary">
            Privacy
          </Link>
          <a
            href="https://twitter.com/tristatelabs"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-primary"
          >
            <Twitter className="h-3 w-3" />
          </a>
          <a
            href="https://github.com/tristatelabs"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-primary"
          >
            <Github className="h-3 w-3" />
          </a>
          <a
            href="mailto:contact@tristatelabs.com"
            className="text-muted-foreground hover:text-primary"
          >
            <Mail className="h-3 w-3" />
          </a>
        </div>
      </div>
    </footer>
  );
} 