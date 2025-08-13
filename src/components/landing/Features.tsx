// src/components/Features.tsx
export default function Features() {
  const items = [
    {
      title: "Gestión de Club y Equipos",
      desc: "Crea tu club, organiza equipos por categorías y mantén toda la estructura bajo control.",
      icon: ShieldIcon,
    },
    {
      title: "Registro de Jugadoras",
      desc: "Datos completos: posición, número, métricas físicas, historial y más.",
      icon: UsersIcon,
    },
    {
      title: "Estadísticas Avanzadas",
      desc: "Registra acciones punto a punto y genera informes para la toma de decisiones.",
      icon: ChartIcon,
    },
    {
      title: "Roles y Permisos",
      desc: "Entrenador principal, asistente y jugadora. Acceso a lo justo y necesario.",
      icon: LockIcon,
    },
  ];

  return (
    <section id="features" className="relative py-24">
      {/* Fade superior para transición suave desde el hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-0 right-0 h-24
                   bg-gradient-to-b from-transparent to-neutral-950"
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <header className="max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Todo lo que necesitas para{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-cyan-300">
              dirigir tu club
            </span>
            .
          </h2>
          <p className="mt-6 text-neutral-300">
            Diseñado para entrenadores que buscan eficiencia, control y una
            experiencia profesional para su staff y jugadoras.
          </p>
        </header>

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((it, idx) => (
            <article
              key={idx}
              className="rounded-2xl bg-white/5 border border-white/10 p-6 hover:bg-white/[0.06] transition group"
            >
              <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center mb-5 group-hover:scale-105 transition">
                <it.icon />
              </div>
              <h3 className="font-semibold text-lg">{it.title}</h3>
              <p className="mt-2 text-sm text-neutral-300 leading-relaxed">{it.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3L4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 3v18h18" />
      <path d="M7 15l4-4 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}
