"use client";

// Botones del hero que hacen scroll suave a las secciones.
export default function HeroActions() {
  const go = (id: string) => () => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: Math.max(0, el.offsetTop - 64), behavior: "smooth" });
  };
  return (
    <div className="hero-actions fi d4">
      <button className="btn-p" onClick={go("roster")}>Ver talentos</button>
      <button className="btn-s" onClick={go("hablemos")}>Hablemos</button>
    </div>
  );
}
