// src/components/Hero.tsx
import volleyballHero from "@/assets/hero-a.png";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden min-h-[72vh] md:min-h-[78vh] lg:min-h-[82vh]">
      {/* Imagen de fondo */}
      <img
        src={volleyballHero}
        alt="Balón de voleibol frente a la red"
        className="
          absolute inset-0 -z-10 h-full w-full object-cover
          object-[center_62%] md:object-[center_55%] lg:object-[center_52%]
          opacity-95 brightness-[0.68] contrast-110 saturate-110
        "
      />

      {/* Degradado lateral para legibilidad del texto (izquierda oscura) */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/55 to-transparent" />

      {/* Viñeta inferior para fundir con la siguiente sección */}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-b from-transparent via-neutral-950/75 to-neutral-950" />

      {/* Toque cálido arriba-derecha */}
      <div className="absolute right-0 top-0 -z-10 h-64 w-64 bg-[radial-gradient(circle_at_80%_20%,rgba(255,140,0,0.26),transparent_60%)]" />

      {/* CONTENIDO */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-24 md:pb-28">
        <div className="max-w-3xl md:pr-24">
          <span className="inline-block text-xs tracking-widest uppercase text-neutral-300/85">
            Gestión profesional para clubes de voleibol
          </span>

          <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.55)]">
            Control total de tu club,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-cyan-300">
              desde el saque
            </span>{" "}
            hasta el punto final.
          </h1>

          <p className="mt-6 text-neutral-200 text-lg max-w-2xl">
            Administra equipos, registra jugadoras, lleva estadísticas avanzadas y colabora
            con tu staff en tiempo real. Todo en una plataforma segura con Supabase.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="/register"
              className="px-6 h-12 inline-flex items-center justify-center rounded-xl bg-white
                         text-neutral-900 font-semibold hover:opacity-90 transition"
            >
              Crear cuenta
            </a>
            <a
              href="#features"
              className="px-6 h-12 inline-flex items-center justify-center rounded-xl border
                         border-white/15 text-white hover:bg-white/5 transition"
            >
              Ver funciones
            </a>
          </div>

          <ul className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-neutral-300">
            <li className="flex items-center gap-2"><Dot /> Estadísticas avanzadas</li>
            <li className="flex items-center gap-2"><Dot /> Roles y permisos</li>
            <li className="flex items-center gap-2"><Dot /> Datos seguros con Supabase</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Dot() {
  return (
    <span className="inline-block h-2 w-2 rounded-full bg-gradient-to-r from-orange-400 to-cyan-300" />
  );
}
