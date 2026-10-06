import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Libera o dev server para dispositivos na mesma rede (ex.: testar no celular).
  // Só afeta desenvolvimento. Se o IP do Mac mudar, atualize aqui.
  allowedDevOrigins: ["192.168.99.18"],
};

export default nextConfig;
