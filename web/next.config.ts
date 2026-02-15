import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local dev host mixes like http://127.0.0.1:3000 -> http://localhost:3000/_next/*
  allowedDevOrigins: ["127.0.0.1", "::1"],
};

export default nextConfig;
