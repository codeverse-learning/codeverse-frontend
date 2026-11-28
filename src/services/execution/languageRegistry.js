
export const LANGUAGE_REGISTRY = {
  python: {
    id: "python",
    label: "Python",
    engine: "browser",
    enabled: true,
    workerFile: "python-worker.js",
    sandboxFile: "python-sandbox.html",
    initializationTimeout: 120000,
    executionTimeout: 15000,
    maxCodeLength: 10000,
    maxSteps: 501,
  },

  javascript: {
    id: "javascript",
    label: "JavaScript",
    engine: "browser",
    enabled: true,
    workerFile: "javascript-worker.js",
    sandboxFile: "execution-sandbox.html",
    initializationTimeout: 30000,
    executionTimeout: 15000,
    maxCodeLength: 10000,
    maxSteps: 501,
    },

  java: {
    id: "java",
    label: "Java",
    engine: "server",
    enabled: false,
  },

  c: {
    id: "c",
    label: "C",
    engine: "server",
    enabled: false,
  },

  cpp: {
    id: "cpp",
    label: "C++",
    engine: "server",
    enabled: false,
  },

  csharp: {
    id: "csharp",
    label: "C#",
    engine: "server",
    enabled: false,
  },

  php: {
    id: "php",
    label: "PHP",
    engine: "server",
    enabled: false,
  },

  dart: {
    id: "dart",
    label: "Dart",
    engine: "server",
    enabled: false,
  },
};

export function getLanguageConfig(language) {
  const key = String(language || "")
    .trim()
    .toLowerCase();

  return Object.prototype.hasOwnProperty.call(
    LANGUAGE_REGISTRY,
    key
  )
    ? LANGUAGE_REGISTRY[key]
    : null;
}

export function isLanguageAvailable(language) {
  return getLanguageConfig(language)?.enabled === true;
}

export function getAvailableLanguages() {
  return Object.values(LANGUAGE_REGISTRY).filter(
    (language) => language.enabled
  );
}
