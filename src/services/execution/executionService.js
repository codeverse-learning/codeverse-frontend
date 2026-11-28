
import {
  getLanguageConfig,
  getAvailableLanguages,
  isLanguageAvailable,
} from "./languageRegistry";

import { executeInSandbox } from "./sandboxExecution";

export async function executeCode(language, code) {
  const config = getLanguageConfig(language);

  if (!config) {
    throw new Error("Unsupported programming language.");
  }

  if (typeof code !== "string" || !code.trim()) {
    throw new Error("Code cannot be empty.");
  }

  if (!config.enabled) {
    throw new Error(
      `${config.label} execution is currently unavailable. Support for this language is under development.`
    );
  }

  switch (config.engine) {
    case "browser":
      return await executeInSandbox(code, config);

    case "server":
      throw new Error(
        `${config.label} requires a compatible execution server.`
      );

    default:
      throw new Error(
        `No execution engine configured for ${config.label}.`
      );
  }
}

export function getExecutionInfo(language) {
  const config = getLanguageConfig(language);

  if (!config) {
    return {
      supported: false,
      available: false,
      engine: null,
      message: "Unsupported programming language.",
    };
  }

  return {
    supported: true,
    available: config.enabled,
    language: config.id,
    label: config.label,
    engine: config.engine,
    message: config.enabled
      ? `${config.label} execution is available.`
      : `${config.label} execution is under development.`,
  };
}

export {
  getAvailableLanguages,
  isLanguageAvailable,
};
