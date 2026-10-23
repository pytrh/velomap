// Next.js configuration, read once when `npm run dev` / `npm start` boots.
// Its one job here: load the repo-root .env (shared with the Spring version)
// so GRAPHHOPPER_API_KEY is available to the server code without exporting it.
// Node's loadEnvFile never overrides a variable that is already set, so a real
// environment variable still wins over the file.
import type { NextConfig } from "next";
import path from "node:path";

try {
  process.loadEnvFile(path.resolve(process.cwd(), "..", ".env"));
} catch {
  // No .env file: rely on the environment instead.
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
