import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  // A stray package-lock.json in the parent folder makes Turbopack infer the
  // workspace root one level too high. Pin it to this directory.
  turbopack: { root: __dirname },
  images: {
    // Product covers live on UploadThing. Scoped to this app's own subdomain
    // and to /f/ rather than a bare `**.ufs.sh`, so the image optimizer can't
    // be pointed at another tenant's bucket. The app id is public — it's in
    // every uploaded file's URL — and is derived from UPLOADTHING_TOKEN.
    remotePatterns: [new URL("https://lv4lb8jo1m.ufs.sh/f/**")],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;
