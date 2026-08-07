import config from "../config/index.js";

import * as memoryRepository from "../store/scanStore.js";

let selectedRepository = memoryRepository;

if (config.persistence === "postgres") {
  // Import postgres repository lazily to avoid requiring 'pg' when using in-memory persistence.
  // Top-level await is supported in ESM; this keeps startup safe when PERSISTENCE=memory.
  const postgresModule = await import("./postgres/scanRepository.js");
  selectedRepository = postgresModule.default;
}

export default selectedRepository;