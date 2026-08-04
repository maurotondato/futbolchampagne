import { cn } from "@/lib/utils";

export function GlassPanel({
  className,
  strong,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { strong?: boolean }) {
  return (
    <div
      className={cn(
        strong ? "glass-strong" : "glass",
        "rounded-2xl",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
