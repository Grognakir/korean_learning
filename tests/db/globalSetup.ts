import { execSync } from "node:child_process";

export default async function globalSetup() {
  execSync("pnpm exec supabase db reset", {
    cwd: process.cwd(),
    stdio: "inherit",
  });
}
