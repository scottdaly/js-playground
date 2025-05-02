self.onmessage = function (event) {
  const { code } = event.data;
  const capturedOutput = [];
  let error = null;
  const MAX_OUTPUT_LINES = 1000; // Limit captured lines
  let outputLimitReached = false;

  const safeConsole = {
    log: (...args) => {
      if (outputLimitReached) return;
      if (capturedOutput.length >= MAX_OUTPUT_LINES) {
        capturedOutput.push(
          "[Error] Excessive output detected. Potential infinite loop? Execution halted."
        );
        outputLimitReached = true;
        error = "Excessive output detected."; // Set specific error flag
        // Optionally, we could terminate the worker here immediately
        // self.close(); // Uncomment to terminate worker early on excessive output
        return;
      }
      capturedOutput.push(
        args
          .map((arg) =>
            typeof arg === "object" ? JSON.stringify(arg) : String(arg)
          )
          .join(" ")
      );
    },
    error: (...args) => {
      if (outputLimitReached) return; // Also check in other console methods
      if (capturedOutput.length >= MAX_OUTPUT_LINES) {
        // No need to repeat the excessive output message if already added by .log
        outputLimitReached = true;
        error = "Excessive output detected.";
        return;
      }
      capturedOutput.push(
        "[Error] " +
          args
            .map((arg) =>
              typeof arg === "object" ? JSON.stringify(arg) : String(arg)
            )
            .join(" ")
      );
    },
    info: (...args) => {
      if (outputLimitReached) return;
      if (capturedOutput.length >= MAX_OUTPUT_LINES) {
        outputLimitReached = true;
        error = "Excessive output detected.";
        return;
      }
      capturedOutput.push(
        "[Info] " +
          args
            .map((arg) =>
              typeof arg === "object" ? JSON.stringify(arg) : String(arg)
            )
            .join(" ")
      );
    },
    warn: (...args) => {
      if (outputLimitReached) return;
      if (capturedOutput.length >= MAX_OUTPUT_LINES) {
        outputLimitReached = true;
        error = "Excessive output detected.";
        return;
      }
      capturedOutput.push(
        "[Warning] " +
          args
            .map((arg) =>
              typeof arg === "object" ? JSON.stringify(arg) : String(arg)
            )
            .join(" ")
      );
    },
    // Add other console methods if needed (e.g., clear, table, etc.)
    // but keep it limited for security/simplicity.
  };

  try {
    // Dynamically create and execute the function
    // Pass the 'safeConsole' object as 'console' within the executed code's scope
    // Stop execution if output limit was reached during setup (unlikely but possible)
    if (!outputLimitReached) {
      const executeCode = new Function("console", code);
      executeCode(safeConsole);
    }
  } catch (e) {
    if (e instanceof Error) {
      error = `[Execution Error] ${e.message}`;
    } else {
      error = "[Execution Error] An unknown error occurred";
    }
    // captured *before* the error, plus the error message itself.
    // Avoid adding duplicate error messages if excessive output already handled it.
    if (!outputLimitReached) {
      capturedOutput.push(error);
    }
  } finally {
    // Post the results back to the main thread
    // Ensure the specific error type is included if the limit was reached
    self.postMessage({ output: capturedOutput, error });
  }
};
