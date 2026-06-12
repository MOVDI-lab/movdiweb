import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "70vh", display: "grid", placeItems: "center", textAlign: "center", padding: "120px 20px" }}>
      <div>
        <div className="lbl">Error 404</div>
        <h1 className="sec-h" style={{ fontSize: "clamp(40px,8vw,90px)", margin: "10px 0 18px" }}>
          No <span className="em">encontramos</span> esto.
        </h1>
        <Link className="btn-p" href="/">Volver al inicio</Link>
      </div>
    </div>
  );
}
