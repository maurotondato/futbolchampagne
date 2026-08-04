"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Last line of defense: if anything below throws during render, show a
 * "reload" screen instead of leaving the page on a blank/black background
 * with no way out (React unmounts the failed tree and there's otherwise
 * nothing left on screen to click).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("App crashed:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center gap-4 bg-void px-6 text-center">
          <p className="text-4xl">⚽💥</p>
          <p className="font-hud text-sm text-ink-dim">
            Se cayó algo. Probá recargar la página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-gradient-to-b from-[#ffe9a8] via-[#e8c979] to-[#a8863f] px-5 py-2.5 font-hud text-sm font-bold uppercase tracking-wide text-[#241a08]"
          >
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
