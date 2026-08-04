"use client";

import { useRouter } from "next/navigation";
import { PageShell, TopBar } from "@/components/ui/PageShell";
import { TeamBuilder } from "@/components/pitch/TeamBuilder";

export default function ArmarPartidoPage() {
  const router = useRouter();
  return (
    <PageShell>
      <TopBar
        title="Armar Partido"
        subtitle="7 vs 7 · Arrastrá y soltá"
        onBack={() => router.push("/")}
      />
      <div className="pt-6">
        <TeamBuilder />
      </div>
    </PageShell>
  );
}
