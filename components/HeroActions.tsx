"use client";

import type { Section } from "./HomeClient";

export default function HeroActions({ onNavigate }: { onNavigate: (s: Section) => void }) {
  return (
    <div className="hero-actions fi d4">
      <button className="btn-p" onClick={() => onNavigate("roster")}>Ver talentos</button>
      <button className="btn-s" onClick={() => onNavigate("hablemos")}>Hablemos</button>
    </div>
  );
}
