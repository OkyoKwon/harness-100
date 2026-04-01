import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: isGitHubPages ? "/harness-100" : "",
  assetPrefix: isGitHubPages ? "/harness-100/" : "",
};

export default nextConfig;
