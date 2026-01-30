import { Heart } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-indigo-950 to-blue-950" />

      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex w-full flex-col items-center gap-8 px-4 py-12">
        {/* ALVIN branding */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Heart className="h-8 w-8 text-cyan-400" fill="currentColor" />
            <Heart className="absolute inset-0 h-8 w-8 animate-ping text-cyan-400/30" />
          </div>
          <span className="text-2xl font-bold tracking-wider text-white">
            ALVIN
          </span>
        </div>

        {children}
      </div>
    </main>
  );
}
