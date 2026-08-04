import config from "../config/index.js";

import * as memoryRepository from "../store/scanStore.js";
import postgresRepository from "./postgres/scanRepository.js";

const repositories = {
  memory: memoryRepository,
  postgres: postgresRepository,
};

export default repositories[config.persistence] || repositories.postgres;