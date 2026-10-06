import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Libera o dev server para dispositivos na mesma rede (ex.: testar no celular).
  // Só afeta desenvolvimento. Se o IP do Mac mudar, atualize aqui.
  allowedDevOrigins: ["192.168.99.18"],
  images: {
    // Foto mock do perfil (Unsplash). Revisar na fase E, quando as fotos vierem do storage.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
