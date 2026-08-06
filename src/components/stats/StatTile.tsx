import { GlassPanel } from "@/components/ui/GlassPanel";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

export function StatTile({
  label,
  value,
  suffix,
  accent,
  decimals = 0,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  accent?: "gold" | "cyan";
  decimals?: number;
}) {
  return (
    <GlassPanel className="p-4 text-center">
      <p className={accent === "cyan" ? "font-display text-3xl text-cyan" : "font-display text-3xl text-gold"}>
        {typeof value === "number" ? <AnimatedNumber value={value} decimals={decimals} duration={1.1} /> : value}
        {suffix && <span className="ml-1 text-lg text-ink-faint">{suffix}</span>}
      </p>
      <p className="mt-1 font-hud text-[10px] uppercase tracking-[0.2em] text-ink-faint">{label}</p>
    </GlassPanel>
  );
}
