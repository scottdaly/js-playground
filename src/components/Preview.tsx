import React, { useState, useEffect } from "react";

interface PreviewProps {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
}

// Timeout duration in milliseconds
const EXECUTION_TIMEOUT = 5000; // 5 seconds

// Define the iframe's Content Security Policy
const iframeCsp =
  "default-src 'none'; script-src 'self' blob: 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'none'; frame-ancestors 'none';";

const Preview: React.FC<PreviewProps> = ({ htmlCode, cssCode, jsCode }) => {
  const [srcDoc, setSrcDoc] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      // Worker code as a string
      // Note: We are embedding the user's actual JS code within the worker's message handler logic.
      // This worker code will run *inside* the iframe's context.
      const workerScript = `
        self.onmessage = function(event) {
          const userCode = event.data.code;
          const capturedOutput = [];
          let error = null;
          const startTime = Date.now(); // For potential fine-grained loop detection within worker (optional)

          // Simple console shim within the worker
          const workerConsole = {
             log: (...args) => capturedOutput.push({ type: 'log', args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)) }),
             error: (...args) => capturedOutput.push({ type: 'error', args: ['[Error]', ...args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))] }),
             warn: (...args) => capturedOutput.push({ type: 'warn', args: ['[Warning]', ...args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))] }),
             info: (...args) => capturedOutput.push({ type: 'info', args: ['[Info]', ...args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))] }),
             clear: () => capturedOutput.push({ type: 'clear' }) // Handle clear command
          };

          try {
            // Execute the user's code with the shimmed console
            const executeCode = new Function('console', userCode);
            executeCode(workerConsole);
          } catch (e) {
             if (e instanceof Error) {
                 error = '[Execution Error] ' + e.message;
             } else {
                 error = '[Execution Error] An unknown error occurred';
             }
             // Ensure error message is captured
             capturedOutput.push({ type: 'error', args: [error] });
          } finally {
            // Post results back to the iframe's main script
            self.postMessage({ output: capturedOutput, error });
          }
        };
      `;

      // Create a Blob from the worker script string
      const blob = new Blob([workerScript], { type: "application/javascript" });
      const workerBlobUrl = URL.createObjectURL(blob);

      // Bootstrapping script for the iframe
      // This script runs in the iframe's main context, creates the worker, manages it, and handles output.
      const iframeBootstrapScript = `
        const workerBlobUrl = '${workerBlobUrl}'; // Pass blob URL to iframe script
        const userJsCode = ${JSON.stringify(
          jsCode
        )}; // Safely embed user JS code
        const timeoutDuration = ${EXECUTION_TIMEOUT};
        let worker = null;
        let workerTimeout = null;

        // Function to display output/errors in the iframe's body
        function displayInPreview(type, args) {
            const outputDiv = document.getElementById('sandbox-output') || document.createElement('div');
            if (!outputDiv.id) {
                outputDiv.id = 'sandbox-output';
                // Basic styling for the output overlay
                outputDiv.style.position = 'fixed';
                outputDiv.style.bottom = '0';
                outputDiv.style.left = '0';
                outputDiv.style.width = '100%';
                outputDiv.style.maxHeight = '30%';
                outputDiv.style.overflowY = 'auto';
                outputDiv.style.background = 'rgba(0,0,0,0.75)';
                outputDiv.style.color = '#fff';
                outputDiv.style.fontSize = '12px';
                outputDiv.style.fontFamily = 'monospace';
                outputDiv.style.padding = '5px';
                outputDiv.style.boxSizing = 'border-box';
                outputDiv.style.zIndex = '10000';
                document.body.appendChild(outputDiv);
            }

            if (type === 'clear') {
                outputDiv.innerHTML = ''; // Clear previous output
                return;
            }

            const message = document.createElement('div');
            message.textContent = args.join(' ');
            if (type === 'error') {
                message.style.color = '#ff7b7b'; // Red for errors
            } else if (type === 'warn') {
                message.style.color = '#ffdd7b'; // Yellow for warnings
            } else {
                 message.style.color = '#eee'; // Default color
            }
            outputDiv.appendChild(message);
            outputDiv.scrollTop = outputDiv.scrollHeight; // Scroll to bottom
        }

        function cleanup() {
            if (workerTimeout) {
                clearTimeout(workerTimeout);
                workerTimeout = null;
            }
            if (worker) {
                worker.terminate();
                worker = null;
            }
            // Revoke the Blob URL when done to free up resources
            URL.revokeObjectURL(workerBlobUrl);
            console.log('Worker cleanup complete.'); // Log in iframe console
        }

        try {
            worker = new Worker(workerBlobUrl);

            worker.onmessage = function(event) {
                const { output, error } = event.data;
                console.log('Message received from worker:', output); // Log in iframe console

                // Display output in the preview overlay
                if (output && output.length > 0) {
                   output.forEach(msg => displayInPreview(msg.type, msg.args));
                }
                 // Display final error if one occurred during execution
                 if(error && (!output || !output.some(m => m.type === 'error' && m.args.includes(error)))) {
                    displayInPreview('error', [error]);
                 }

                cleanup();
            };

            worker.onerror = function(errorEvent) {
                console.error('Error from worker:', errorEvent); // Log in iframe console
                const errorMessage = '[Worker Error] ' + (errorEvent.message || 'Unknown worker error');
                displayInPreview('error', [errorMessage]);
                errorEvent.preventDefault(); // Prevent browser default error handling
                cleanup();
            };

            // Set timeout for the worker
            workerTimeout = setTimeout(function() {
                console.warn('Worker execution timed out.'); // Log in iframe console
                displayInPreview('error', ['[Timeout Error] Code execution timed out after ' + (timeoutDuration / 1000) + ' seconds. Potential infinite loop detected.']);
                cleanup();
            }, timeoutDuration);

            // Start the worker
            console.log('Posting code to worker...'); // Log in iframe console
            worker.postMessage({ code: userJsCode });

        } catch (e) {
            console.error('Error setting up worker:', e); // Log in iframe console
             const setupErrorMessage = '[Setup Error] Could not initialize code execution environment: ' + (e.message || 'Unknown error');
             displayInPreview('error', [setupErrorMessage]);
             cleanup(); // Ensure cleanup even if setup fails
        }

        // Optional: Add a listener to clean up the worker if the iframe unloads
        window.addEventListener('unload', cleanup);

      `;

      setSrcDoc(`
        <html>
          <head>
            <meta http-equiv="Content-Security-Policy" content="${iframeCsp}">
            <style>${cssCode}</style>
          </head>
          <body>
            ${htmlCode}
            <script type="module">
              ${iframeBootstrapScript}
            </script>
          </body>
        </html>
      `);

      // Need to clean up the blob URL if the component unmounts or props change
      // before the iframe's 'unload' event fires (which might not happen reliably).
      return () => {
        URL.revokeObjectURL(workerBlobUrl); // Revoke immediately on effect cleanup
        clearTimeout(timeout);
      };
    }, 250); // Debounce update by 250ms

    // Clear timeout if props change before delay is up
    return () => clearTimeout(timeout);
  }, [htmlCode, cssCode, jsCode]); // Re-run effect if code changes

  return (
    <iframe
      srcDoc={srcDoc}
      title="Preview"
      // Stricter sandbox: allow scripts, but block forms, popups, top-navigation, etc.
      // 'allow-same-origin' is NOT included, preventing access to parent origin's resources.
      // If the Blob worker fails due to origin issues, we might need to add 'allow-same-origin',
      // but it's more secure to avoid if possible.
      sandbox="allow-scripts"
      frameBorder="0"
      width="100%"
      height="100%"
      className="bg-white dark:bg-[#161F20]" // Updated dark bg
    />
  );
};

export default Preview;
