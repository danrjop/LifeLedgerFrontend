import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-bg-tertiary/50 bg-bg-secondary">
      <div className="mx-auto max-w-5xl px-8 py-16">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between md:gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="text-xl font-semibold text-fg-primary tracking-tight"
            >
              LifeLedger
            </Link>
            <p className="max-w-xs text-sm text-fg-secondary leading-relaxed">
              Your personal document and expense tracker. Find everything, miss
              nothing.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex gap-16">
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-fg-primary tracking-heading">
                Pages
              </h3>
              <nav className="flex flex-col gap-2">
                <Link
                  href="/"
                  className="text-sm text-fg-secondary hover:text-fg-primary transition-colors duration-200"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="text-sm text-fg-secondary hover:text-fg-primary transition-colors duration-200"
                >
                  About
                </Link>
                <Link
                  href="/login"
                  className="text-sm text-fg-secondary hover:text-fg-primary transition-colors duration-200"
                >
                  Login
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-bg-tertiary/50 pt-8 md:flex-row">
          <p className="text-sm text-fg-tertiary">
            &copy; {new Date().getFullYear()} LifeLedger. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
