"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dices, Send } from "lucide-react";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { GlowButton } from "@/components/ui/GlowButton";
import { useSound } from "@/components/ui/SoundProvider";
import { randomCargadaExcluding } from "@/lib/cargadasPhrases";
import { whatsappLink } from "@/lib/whatsapp";
import type { Player } from "@/lib/data/types";

export function CargadaCard({ player }: { player: Player }) {
  const [phrase, setPhrase] = useState("");
  const { play } = useSound();

  function generate() {
    play("whoosh", { volume: 0.25 });
    setPhrase((prev) => randomCargadaExcluding(prev, player.nickname || player.name.split(" ")[0]));
  }

  return (
    <div className="glass flex flex-col gap-3 rounded-2xl border border-line p-4">
      <div className="flex items-center gap-3">
        <PlayerAvatar player={player} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-hud text-sm font-semibold text-ink">
            {player.nickname || player.name}
          </p>
          <p className="truncate font-hud text-[11px] uppercase tracking-wide text-ink-faint">
            {player.favoritePosition}
          </p>
        </div>
      </div>

      <div className="min-h-[64px] rounded-xl border border-dashed border-line bg-white/[0.03] p-3">
        <AnimatePresence mode="wait">
          {phrase ? (
            <motion.p
              key={phrase}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="font-hud text-sm italic text-ink-dim"
            >
              &ldquo;{phrase}&rdquo;
            </motion.p>
          ) : (
            <p className="font-hud text-xs text-ink-faint">
              Tocá &ldquo;Mandar cargada&rdquo; para generar una…
            </p>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-2">
        <GlowButton variant="ghost" onClick={generate} className="flex flex-1 items-center justify-center gap-1.5 !px-3 !py-2 text-xs">
          <Dices size={14} /> Mandar cargada
        </GlowButton>
        <GlowButton
          variant="cyan"
          disabled={!phrase}
          onClick={() => window.open(whatsappLink(phrase, player.phone), "_blank")}
          className="flex flex-1 items-center justify-center gap-1.5 !px-3 !py-2 text-xs"
        >
          <Send size={14} /> WhatsApp
        </GlowButton>
      </div>
    </div>
  );
}
