import { ModuleRegistry } from "@/features/training/domain";

import { sampleModule } from "./sample";

export const learningModuleRegistry = new ModuleRegistry([sampleModule]);
