v
(() => {
  "use strict";

  const MAX_STEPS = 500;
  const MAX_OUTPUT_LENGTH = 10000;
  const MAX_VARIABLES = 50;
  const MAX_VARIABLE_LENGTH = 200;

  const send = self.postMessage.bind(self);

  const steps = [];

  let output = "";
  let executionError = null;
  let limitExceeded = false;

  function serializeValue(value) {
    try {
      let result;

      if (value === undefined) {
        result = "undefined";
      } else if (value === null) {
        result = "null";
      } else if (typeof value === "string") {
        result = JSON.stringify(value);
      } else if (typeof value === "bigint") {
        result = `${value}n`;
      } else if (typeof value === "function") {
        result = "[Function]";
      } else if (typeof value === "symbol") {
        result = String(value);
      } else if (typeof value === "object") {
        result = JSON.stringify(value);

        if (result === undefined) {
          result = "[Object]";
        }
      } else {
        result = String(value);
      }

      return result.slice(0, MAX_VARIABLE_LENGTH);

    } catch {
      return "[Unavailable]";
    }
  }

  function appendOutput(values) {
    if (limitExceeded) {
      throw new Error("Execution limit exceeded.");
    }

    const text = values
      .map((value) => {
        if (typeof value === "string") {
          return value;
        }

        return serializeValue(value);
      })
      .join(" ");

    if (
      output.length + text.length + 1 >
      MAX_OUTPUT_LENGTH
    ) {
      limitExceeded = true;

      throw new Error(
        "Maximum console output exceeded."
      );
    }

    output += `${text}\n`;
  }

  const executionConsole = Object.freeze({
    log: (...values) => appendOutput(values),
    info: (...values) => appendOutput(values),
    warn: (...values) => appendOutput(values),
    error: (...values) => appendOutput(values),
    debug: (...values) => appendOutput(values),

    clear: () => {
      output = "";
    },

    assert: (condition, ...values) => {
      if (!condition) {
        appendOutput([
          "Assertion failed:",
          ...values
        ]);
      }
    },
  });

  function trace(lineNumber, event, getters) {
    if (limitExceeded) {
      throw new Error("Execution limit exceeded.");
    }

    if (steps.length >= MAX_STEPS) {
      limitExceeded = true;

      throw new Error(
        "Maximum execution steps exceeded."
      );
    }

    const variables = Object.create(null);

    if (Array.isArray(getters)) {
      for (const entry of getters.slice(
        0,
        MAX_VARIABLES
      )) {
        if (
          !Array.isArray(entry) ||
          typeof entry[0] !== "string" ||
          typeof entry[1] !== "function"
        ) {
          continue;
        }

        const [name, getter] = entry;

        try {
          variables[name] = serializeValue(
            getter()
          );
        } catch {
          // Variable is not initialized or
          // unavailable in the current scope.
        }
      }
    }

    steps.push({
      stepNumber: steps.length + 1,

      lineNumber: Math.max(
        1,
        Number(lineNumber) || 1
      ),

      event,

      variables,

      output,

      explanation:
        event === "completed"
          ? "Program execution completed successfully."
          : `Preparing to execute line ${lineNumber}`,
    });
  }

  function run(program) {
    send({
      type: "STATUS",
      phase: "EXECUTING",
      message: "Executing JavaScript code...",
    });

    try {
      program(trace, executionConsole);

      if (limitExceeded) {
        throw new Error(
          "Execution limit exceeded."
        );
      }

    } catch (error) {
      executionError = (
        `${error?.name || "Error"}: ` +
        `${error?.message || String(error)}`
      ).slice(0, 20000);
    }

    send({
      type: "RESULT",

      data: {
        language: "javascript",
        success: executionError === null,
        steps,
        output,
        error: executionError,
      },
    });
  }

  Object.defineProperty(
    self,
    "__CODEVERSE_RUN_JAVASCRIPT__",
    {
      value: run,
      writable: false,
      configurable: false,
      enumerable: false,
    }
  );
})();
