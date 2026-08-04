import { cn } from "@/lib/utils";
import { ParticleField } from "./ParticleField";

export function PageShell({
  children,
  className,
  particles = true,
}: {
  children: React.ReactNode;
  className?: string;
  particles?: boolean;
}) {
  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-void">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(53,226,226,0.16),transparent_55%),radial-gradient(ellipse_at_100%_100%,rgba(232,201,121,0.14),transparent_50%),radial-gradient(ellipse_at_0%_60%,rgba(232,201,121,0.06),transparent_45%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#03050900,#030509_90%)]" />
        <div className="grain absolute inset-0" />
        {particles && (
          <div className="absolute inset-0 opacity-70">
            <ParticleField density={45} />
          </div>
        )}
      </div>
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
}

export function TopBar({
  title,
  subtitle,
  right,
  onBack,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onBack?: () => void;
}) {
  return (
    <div className="sticky top-0 z-30 border-b border-line bg-void/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/5 text-ink-dim transition hover:border-gold/60 hover:text-gold"
              aria-label="Volver"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className="transition -translate-x-0 group-hover:-translate-x-0.5"
              >
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          <div>
            <h1 className="font-display text-3xl tracking-wide text-ink sm:text-4xl">
              {title}
            </h1>
            {subtitle && (
              <p className="font-hud text-xs uppercase tracking-[0.2em] text-ink-faint">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {right}
      </div>
    </div>
  );
}
