import { instrumentJavaScript } from "./javascriptInstrumenter";

const BASE_URL = import.meta.env.BASE_URL || "/";

const WORKER_FETCH_TIMEOUT = 30000;

export async function executeInSandbox(code, config) {
  if (!config || config.engine !== "browser") {
    throw new Error(
      "Invalid browser execution configuration."
    );
  }

  if (!config.enabled) {
    throw new Error(
      `${config.label} execution is currently unavailable.`
    );
  }

  if (typeof code !== "string" || !code.trim()) {
    throw new Error("Code cannot be empty.");
  }

  const maxCodeLength = config.maxCodeLength || 10000;

  if (code.length > maxCodeLength) {
    throw new Error(
      `Code cannot exceed ${maxCodeLength.toLocaleString()} characters.`
    );
  }

  let workerSource;

  try {
    const response = await fetch(
      `${BASE_URL}sandbox/${config.workerFile}`,
      {
        credentials: "omit",
        signal: AbortSignal.timeout(
          WORKER_FETCH_TIMEOUT
        ),
      }
    );

    if (!response.ok) {
      throw new Error("Worker file unavailable.");
    }

    
workerSource = await response.text();

    if (config.id === "javascript") {
    const instrumented = instrumentJavaScript(code);

    workerSource += `

    self.addEventListener("message", function(event) {
    if (
        !event.data ||
        event.data.type !== "EXECUTE" ||
        event.data.language !== "javascript"
    ) {
        return;
    }

    self.__CODEVERSE_RUN_JAVASCRIPT__(
        function(${instrumented.traceName}, console) {

    ${instrumented.instrumentedCode}

        }
    );
    }, { once: true });

    `;
    }


    if (
      !workerSource.trim() ||
      /^\s*</.test(workerSource)
    ) {
      throw new Error("Invalid worker file.");
    }

  } catch (error) {
    if (error?.message?.startsWith("SyntaxError:")) {
        throw error;
    }

    throw new Error(
        `${config.label} execution engine is currently unavailable. Please try again later.`
    );
    }

  return new Promise((resolve, reject) => {
    let iframe = null;
    let timeoutId = null;
    let finished = false;
    let started = false;
    let executing = false;

    function cleanup() {
      clearTimeout(timeoutId);

      window.removeEventListener(
        "message",
        handleMessage
      );

      if (iframe) {
        iframe.remove();
        iframe = null;
      }
    }

    function fail(message) {
      if (finished) return;

      finished = true;
      cleanup();

      reject(new Error(message));
    }

    function succeed(data) {
      if (finished) return;

      finished = true;
      cleanup();

      resolve(data);
    }

    function startTimeout(duration, message) {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        fail(message);
      }, duration);
    }

    function validateResult(data) {
      if (!data || typeof data !== "object") {
        return false;
      }

      if (data.language !== config.id) {
        return false;
      }

      if (typeof data.success !== "boolean") {
        return false;
      }

      if (!Array.isArray(data.steps)) {
        return false;
      }

      if (data.steps.length > (config.maxSteps || 501)) {
        return false;
      }

      if (
        typeof data.output !== "string" ||
        data.output.length > 10000
      ) {
        return false;
      }

      if (
        data.error !== null &&
        (
          typeof data.error !== "string" ||
          data.error.length > 20000
        )
      ) {
        return false;
      }

      return data.steps.every((step) => {
        if (!step || typeof step !== "object") {
          return false;
        }

        return (
          Number.isInteger(step.stepNumber) &&
          step.stepNumber > 0 &&
          Number.isInteger(step.lineNumber) &&
          step.lineNumber > 0 &&
          typeof step.event === "string" &&
          typeof step.explanation === "string" &&
          typeof step.output === "string" &&
          step.output.length <= 10000 &&
          step.variables !== null &&
          typeof step.variables === "object" &&
          !Array.isArray(step.variables) &&
          Object.keys(step.variables).length <= 50 &&
          Object.values(step.variables).every(
            (value) =>
              typeof value === "string" &&
              value.length <= 200
          )
        );
      });
    }

    function handleMessage(event) {
      if (finished || !iframe) return;

      if (event.source !== iframe.contentWindow) {
        return;
      }

      if (event.origin !== "null") {
        return;
      }

      const response = event.data;

      if (!response || typeof response !== "object") {
        return;
      }

      switch (response.type) {
        case "READY": {
          if (started) return;

          started = true;

          iframe.contentWindow.postMessage(
            {
              type: "EXECUTE",
              language: config.id,
              code,
              workerSource,
            },
            "*"
          );

          break;
        }

        case "STATUS": {
          if (!started || executing) return;

          const executionStarted =
            response.phase === "EXECUTING" ||
            response.message ===
              `Executing ${config.label} code...`;

          if (executionStarted) {
            executing = true;

            startTimeout(
              config.executionTimeout || 15000,
              "Execution time limit exceeded. Please check your code for infinite loops or long-running operations."
            );
          }

          break;
        }

        case "RESULT": {
          if (!started) return;

          if (!validateResult(response.data)) {
            fail(
              `Invalid ${config.label} execution response.`
            );
            return;
          }

          succeed(response.data);

          break;
        }

        case "ERROR": {
          fail(
            typeof response.message === "string"
              ? response.message.slice(0, 2000)
              : `${config.label} execution is currently unavailable.`
          );

          break;
        }

        default:
          break;
      }
    }

    try {
      iframe = document.createElement("iframe");

      iframe.setAttribute(
        "sandbox",
        "allow-scripts"
      );

      iframe.setAttribute(
        "aria-hidden",
        "true"
      );

      iframe.setAttribute(
        "referrerpolicy",
        "no-referrer"
      );

      iframe.setAttribute("tabindex", "-1");

      iframe.title =
        `${config.label} Execution Sandbox`;

      iframe.style.display = "none";

      iframe.src =
        `${BASE_URL}sandbox/${config.sandboxFile}`;

      window.addEventListener(
        "message",
        handleMessage
      );

      iframe.onerror = () => {
        fail(
          `Unable to initialize the ${config.label} execution sandbox.`
        );
      };

      startTimeout(
        config.initializationTimeout || 30000,
        `${config.label} runtime initialization timed out. Please try again.`
      );

      document.body.appendChild(iframe);

    } catch {
      fail(
        `The ${config.label} execution sandbox could not be initialized.`
      );
    }
  });
}
