export default function Testimonials() {
  const items = [
    {
      name: "Carlos M.",
      role: "Entrenador Principal – Club Andino",
      quote:
        "Simplificó totalmente nuestra gestión. El registro de jugadoras y las estadísticas nos ahorran horas cada semana.",
    },
    {
      name: "Diana R.",
      role: "Asistente Técnica – Volei Norte",
      quote:
        "La colaboración entre staff es impecable. Todo está centralizado y es muy fácil de usar.",
    },
    {
      name: "Valeria G.",
      role: "Libero – U18",
      quote:
        "Puedo ver mis datos, evolución y metas. Me motiva a entrenar mejor.",
    },
  ];

  return (
    <section id="testimonials" className="py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <header className="max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Hecho para clubes que{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-cyan-300">
              quieren ganar
            </span>
            .
          </h2>
          <p className="mt-6 text-neutral-300">
            Historias reales de equipos que convirtieron el caos en organización
            y el esfuerzo en resultados medibles.
          </p>
        </header>

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t, idx) => (
            <article key={idx} className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <p className="text-neutral-200 leading-relaxed">“{t.quote}”</p>
              <div className="mt-6">
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-neutral-400">{t.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
