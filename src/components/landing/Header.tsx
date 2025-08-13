import { useState } from "react";
import logoUrl from "/images/logo.png";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60 bg-neutral-950/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt="VoleiProManager"
              className="h-16 w-16 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="font-extrabold tracking-tight text-xl">
              Volei<span className="text-orange-400">Pro</span>Manager
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="hover:text-white text-neutral-300">
              Funciones
            </a>
            <a href="#testimonials" className="hover:text-white text-neutral-300">
              Opiniones
            </a>
            <a href="#precios" className="hover:text-white text-neutral-300">
              Planes
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a
              href="/login"
              className="px-4 h-10 inline-flex items-center justify-center rounded-lg border border-white/10 hover:bg-white/5 transition text-sm"
            >
              Iniciar sesión
            </a>
            <a
              href="/register"
              className="px-4 h-10 inline-flex items-center justify-center rounded-lg bg-white text-neutral-900 font-semibold hover:opacity-90 transition text-sm"
            >
              Crear cuenta
            </a>
          </div>

          {/* Mobile */}
          <button
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menú"
          >
            <span className="sr-only">Abrir menú</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="text-neutral-200"
            >
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-white/10 py-4 space-y-2">
            <a href="#features" className="block px-2 py-2 rounded hover:bg-white/5">
              Funciones
            </a>
            <a href="#testimonials" className="block px-2 py-2 rounded hover:bg-white/5">
              Opiniones
            </a>
            <a href="#precios" className="block px-2 py-2 rounded hover:bg-white/5">
              Planes
            </a>
            <div className="pt-2 flex gap-2">
              <a
                href="/login"
                className="flex-1 px-4 h-10 inline-flex items-center justify-center rounded-lg border border-white/10 hover:bg-white/5 transition text-sm"
              >
                Iniciar sesión
              </a>
              <a
                href="/register"
                className="flex-1 px-4 h-10 inline-flex items-center justify-center rounded-lg bg-white text-neutral-900 font-semibold hover:opacity-90 transition text-sm"
              >
                Crear cuenta
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
