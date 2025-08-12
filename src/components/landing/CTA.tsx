export default function CTA() {
  return (
    <section className="py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="rounded-3xl bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-950 border border-white/10 p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Lleva tu club al siguiente nivel.
          </h2>
          <p className="mt-6 text-neutral-300 max-w-2xl mx-auto">
            Organización, datos y decisión. VoleiProManager es la herramienta que
            tu staff necesita para enfocarse en lo que importa: el juego.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <a
              href="/register"
              className="px-6 h-12 inline-flex items-center justify-center rounded-xl bg-white text-neutral-900 font-semibold hover:opacity-90 transition"
            >
              Crear cuenta gratis
            </a>
            <a
              href="#precios"
              className="px-6 h-12 inline-flex items-center justify-center rounded-xl border border-white/10 hover:bg-white/5 transition"
            >
              Ver planes
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
