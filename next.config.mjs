/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig = {
  reactStrictMode: true,
  // Las imágenes del roster viven en Cloudinary y Supabase Storage.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Conserva las rutas profundas que ya existían en el sitio anterior.
  async redirects() {
    return [
      { source: "/roster", destination: "/#roster", permanent: true },
      { source: "/servicios", destination: "/#servicios", permanent: true },
      { source: "/nosotros", destination: "/#nosotros", permanent: true },
      { source: "/unete", destination: "/#unete", permanent: true },
      { source: "/contacto", destination: "/#hablemos", permanent: true },
      { source: "/hablemos", destination: "/#hablemos", permanent: true },
      { source: "/admin-roster.html", destination: "/admin", permanent: true },
    ];
  },
};

export default nextConfig;
