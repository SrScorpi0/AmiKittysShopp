export default function LandingFooter() {
  return (
    <section id="contacto" className="bg-[#fff5f7] py-16 px-6 lg:px-20 border-t border-[#ff85a1]/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex items-center gap-4">
          <div className="text-[#ff85a1]/70">
            <i className="bi bi-heart-fill text-4xl" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-[#800e33] tracking-tight">AmiKittyShop</h3>
            <p className="text-[#800e33]/50 text-sm font-medium">
              Cosillas bellas de Hello Kitty desde Rosario
            </p>
          </div>
        </div>
        <div className="flex gap-10">
          <a className="text-[#800e33]/60 hover:text-[#ff85a1] transition-colors" href="#">
            <i className="bi bi-instagram" />
          </a>
          <a className="text-[#800e33]/60 hover:text-[#ff85a1] transition-colors" href="#">
            <i className="bi bi-tiktok" />
          </a>
          <a className="text-[#800e33]/60 hover:text-[#ff85a1] transition-colors" href="#">
            <i className="bi bi-envelope" />
          </a>
        </div>
        <p className="text-[#800e33]/40 text-[10px] font-extrabold uppercase tracking-[0.2em]">
          © 2026 AmiKittyShop. Todos los derechos reservados.
        </p>
      </div>
    </section>
  );
}
