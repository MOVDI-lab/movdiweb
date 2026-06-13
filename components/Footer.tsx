import { waLink } from "@/lib/data";
import { IgIcon, LinkedInIcon, WaIcon } from "./icons";

export default function Footer() {
  return (
    <footer>
      <div className="logo">MOV<span className="em">DI</span></div>
      <div className="foot-social">
        <a href="https://www.instagram.com/movdimx/" target="_blank" rel="noopener"><IgIcon />Instagram</a>
        <a href="https://mx.linkedin.com/company/movdi" target="_blank" rel="noopener"><LinkedInIcon />LinkedIn</a>
        <a href={waLink("Hola MOVDI, quiero más información")} target="_blank" rel="noopener"><WaIcon />WhatsApp</a>
      </div>
      <div>© {new Date().getFullYear()} MOVDI · Digital Movement Agency · Ciudad de México</div>
    </footer>
  );
}
