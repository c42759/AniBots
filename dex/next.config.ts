import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "export",
	distDir: "build",
	trailingSlash: true,
};

export default nextConfig;
