
const INITIALIZATION_TIMEOUT = 120000;
const EXECUTION_TIMEOUT = 15000;
const MAX_CODE_LENGTH = 10000;

const BASE_URL = import.meta.env.BASE_URL || "/";

export async function executePython(code) {
  if (typeof code !== "string" || !code.trim()) {
    throw new Error("Code cannot be empty.");
  }

  if (code.length > MAX_CODE_LENGTH) {
    throw new Error(
      "Code cannot exceed 10,000 characters."
    );
  }

  let workerSource;

  try {
    const response = await fetch(
      `${BASE_URL}sandbox/python-worker.js`,
      {
        credentials: "omit",
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!response.ok) {
      throw new Error("Worker file unavailable.");
    }

    workerSource = await response.text();
  } catch {
    throw new Error(
      "Python execution engine is currently unavailable. Please try again later."
    );
  }

  return new Promise((resolve, reject) => {
    let iframe = null;
    let timeoutId = null;
    let finished = false;
    let started = false;

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
        case "READY":
          if (started) return;

          started = true;

          iframe.contentWindow.postMessage(
            {
              type: "EXECUTE",
              code,
              workerSource,
            },
            "*"
          );

          break;

        case "STATUS":
          if (!started) return;

          if (
            response.message ===
            "Executing Python code..."
          ) {
            startTimeout(
              EXECUTION_TIMEOUT,
              "Execution time limit exceeded. Please check your code for infinite loops or long-running operations."
            );
          }

          break;

        case "RESULT":
          if (!started) return;

          if (
            !response.data ||
            response.data.language !== "python" ||
            !Array.isArray(response.data.steps) ||
            response.data.steps.length > 501
          ) {
            fail("Invalid Python execution response.");
            return;
          }

          succeed(response.data);

          break;

        case "ERROR":
          fail(
            typeof response.message === "string"
              ? response.message.slice(0, 2000)
              : "Python execution is currently unavailable."
          );

          break;

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

      iframe.title = "Python Execution Sandbox";

      iframe.style.display = "none";

      iframe.src =
        `${BASE_URL}sandbox/python-sandbox.html`;

      window.addEventListener(
        "message",
        handleMessage
      );

      iframe.onerror = () => {
        fail(
          "Unable to initialize the Python execution sandbox."
        );
      };

      startTimeout(
        INITIALIZATION_TIMEOUT,
        "Python runtime initialization timed out. Please check your internet connection and try again."
      );

      document.body.appendChild(iframe);

    } catch {
      fail(
        "The Python execution sandbox could not be initialized."
      );
    }
  });
}
