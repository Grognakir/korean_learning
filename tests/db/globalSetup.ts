import { execSync } from "node:child_process";

export default async function globalSetup() {
  // Call the local binary directly: the shell Vitest spawns may not have `pnpm` on PATH.
  execSync("node_modules/.bin/supabase db reset", {
    cwd: process.cwd(),
    stdio: "inherit",
  });
}
