import { parseDeploymentSupabaseEnv } from "../src/lib/validation/env";
import { describeContentSource } from "../src/modules/contentSource";

try {
  parseDeploymentSupabaseEnv(process.env);
  console.log(describeContentSource(process.env));
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error("Deployment environment validation failed.");
  }

  process.exit(1);
}
