export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
          <p className="font-semibold">
            Volei<span className="text-orange-400">Pro</span>Manager
          </p>
          <nav className="flex flex-wrap gap-6 text-sm text-neutral-400">
            <a href="#" className="hover:text-white">Términos</a>
            <a href="#" className="hover:text-white">Privacidad</a>
            <a href="#" className="hover:text-white">Soporte</a>
            <a href="#" className="hover:text-white">Contacto</a>
          </nav>
        </div>

        <p className="mt-8 text-xs text-neutral-500">
          © {new Date().getFullYear()} VoleiProManager. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
