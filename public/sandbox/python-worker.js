
const PYODIDE_URL =
  "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";

const PYTHON_TRACER = `
import json
import sys
import io
import traceback
from contextlib import redirect_stdout

MAX_STEPS = 500
MAX_CODE_LENGTH = 10000
MAX_OUTPUT_LENGTH = 10000
MAX_VARIABLES = 50
MAX_VARIABLE_LENGTH = 200


class LimitedOutput(io.StringIO):

    def write(self, text):
        if self.tell() + len(text) > MAX_OUTPUT_LENGTH:
            raise RuntimeError(
                "Maximum console output exceeded"
            )

        return super().write(text)


def serialize_variables(local_vars):

    result = {}

    for name, value in local_vars.items():

        if name.startswith("__"):
            continue

        if len(result) >= MAX_VARIABLES:
            break

        try:
            result[name] = repr(value)[:MAX_VARIABLE_LENGTH]

        except Exception:
            result[name] = "<unavailable>"

    return result


def trace_code(source):

    steps = []
    output_buffer = LimitedOutput()
    error = None

    namespace = {
        "__name__": "__main__"
    }

    def add_step(line_number, event, variables, explanation):

        steps.append({
            "stepNumber": len(steps) + 1,
            "lineNumber": line_number,
            "event": event,
            "variables": serialize_variables(variables),
            "output": output_buffer.getvalue(),
            "explanation": explanation
        })

    def tracer(frame, event, arg):

        if frame.f_code.co_filename != "<user_code>":
            return tracer

        if event == "line":

            if len(steps) >= MAX_STEPS:
                raise RuntimeError(
                    "Maximum execution steps exceeded"
                )

            add_step(
                frame.f_lineno,
                "line",
                frame.f_locals,
                f"Preparing to execute line {frame.f_lineno}"
            )

        return tracer

    try:

        if not isinstance(source, str):
            raise ValueError("Code must be a string")

        if not source.strip():
            raise ValueError("Code cannot be empty")

        if len(source) > MAX_CODE_LENGTH:
            raise ValueError("Code is too long")

        compiled = compile(
            source,
            "<user_code>",
            "exec"
        )

        with redirect_stdout(output_buffer):

            sys.settrace(tracer)

            exec(compiled, namespace)

    except BaseException:

        error = traceback.format_exc(limit=3)

    finally:

        sys.settrace(None)

    if error is None:

        add_step(
            max(1, len(source.splitlines())),
            "completed",
            namespace,
            "Program execution completed successfully."
        )

    return {
        "language": "python",
        "success": error is None,
        "steps": steps,
        "output": output_buffer.getvalue(),
        "error": error
    }
`;

let started = false;

self.onmessage = async (event) => {
  const message = event.data;

  if (!message || message.type !== "EXECUTE") return;
  if (started) return;

  started = true;

  try {
    if (
      typeof message.code !== "string" ||
      !message.code.trim()
    ) {
      throw new Error("Code cannot be empty.");
    }

    if (message.code.length > 10000) {
      throw new Error("Code is too long.");
    }

    self.postMessage({
      type: "STATUS",
      message: "Initializing Python runtime..."
    });

    importScripts(`${PYODIDE_URL}pyodide.js`);

    const pyodide = await loadPyodide({
      indexURL: PYODIDE_URL
    });

    await pyodide.runPythonAsync(PYTHON_TRACER);

    self.postMessage({
      type: "STATUS",
      message: "Executing Python code..."
    });

    pyodide.globals.set(
      "user_source",
      message.code
    );

    const result = await pyodide.runPythonAsync(
      "json.dumps(trace_code(user_source))"
    );

    self.postMessage({
      type: "RESULT",
      data: JSON.parse(result)
    });

  } catch (error) {
    self.postMessage({
      type: "ERROR",
      errorCode: "PYTHON_RUNTIME_ERROR",
      message:
        error?.message ||
        "Python execution is currently unavailable."
    });
  }
};
