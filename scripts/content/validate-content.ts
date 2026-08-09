import {
  assertNoAppContentImports,
  ContentValidationError,
  validatePhase2Content,
} from "./contentValidation";

try {
  const manifest = validatePhase2Content();
  assertNoAppContentImports();
  console.log(
    `Content validation passed (schemaVersion=${manifest.schemaVersion}, sources=${manifest.sources.length}).`,
  );
} catch (error) {
  if (error instanceof ContentValidationError) {
    console.error(error.message);
  } else if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error("Content validation failed.");
  }

  process.exit(1);
}
