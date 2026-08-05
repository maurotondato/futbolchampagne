import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Rajdhani, Barlow } from "next/font/google";
import "./globals.css";
import { SoundProvider } from "@/components/ui/SoundProvider";
import { PasswordGate } from "@/components/auth/PasswordGate";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { VersionGuard } from "@/components/VersionGuard";

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Fútbol Champagne ⚽ | Los Martes",
  description:
    "El menú principal de los martes de fulbito. Armá los equipos, mirá las estadísticas y mandate una cargada.",
};

export const viewport: Viewport = {
  themeColor: "#05070d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${bebas.variable} ${rajdhani.variable} ${barlow.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-void text-ink">
        <ErrorBoundary>
          <VersionGuard />
          <SoundProvider>
            <PasswordGate>{children}</PasswordGate>
          </SoundProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
