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
  // Las URLs de sección sirven la home; el cliente abre el panel correcto
  // leyendo el pathname (así /roster, /servicios… siguen funcionando).
  async rewrites() {
    return [
      { source: "/roster", destination: "/" },
      { source: "/servicios", destination: "/" },
      { source: "/nosotros", destination: "/" },
      { source: "/unete", destination: "/" },
      { source: "/contacto", destination: "/" },
      { source: "/hablemos", destination: "/" },
    ];
  },
  async redirects() {
    return [{ source: "/admin-roster.html", destination: "/admin", permanent: true }];
  },
};

export default nextConfig;
