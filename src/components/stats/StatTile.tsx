import { GlassPanel } from "@/components/ui/GlassPanel";

export function StatTile({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  accent?: "gold" | "cyan";
}) {
  return (
    <GlassPanel className="p-4 text-center">
      <p className={accent === "cyan" ? "font-display text-3xl text-cyan" : "font-display text-3xl text-gold"}>
        {value}
        {suffix && <span className="ml-1 text-lg text-ink-faint">{suffix}</span>}
      </p>
      <p className="mt-1 font-hud text-[10px] uppercase tracking-[0.2em] text-ink-faint">{label}</p>
    </GlassPanel>
  );
}
