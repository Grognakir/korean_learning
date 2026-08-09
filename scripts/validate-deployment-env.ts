import { parseDeploymentSupabaseEnv } from "../src/lib/validation/env";

try {
  parseDeploymentSupabaseEnv(process.env);
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error("Deployment environment validation failed.");
  }

  process.exit(1);
}
