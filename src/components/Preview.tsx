import React, { useState, useEffect } from "react";

interface PreviewProps {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
}

// Timeout duration for debouncing updates
const DEBOUNCE_TIMEOUT = 250; // 250ms

// Define the iframe's Content Security Policy (Simpler version for direct execution)
// No need for blob: or unsafe-eval for the bootstrap/worker itself anymore.
// 'unsafe-inline' is needed for the embedded user script.
const iframeCsp =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'none'; frame-ancestors 'none';";

const Preview: React.FC<PreviewProps> = ({ htmlCode, cssCode, jsCode }) => {
  const [srcDoc, setSrcDoc] = useState("");

  useEffect(() => {
    // Debounce the srcDoc update
    const timeout = setTimeout(() => {
      // Removed workerScript, blob, workerBlobUrl, iframeBootstrapScript logic

      setSrcDoc(`
        <html>
          <head>
            <meta http-equiv="Content-Security-Policy" content="${iframeCsp}">
            <style>${cssCode}</style>
          </head>
          <body>
            ${htmlCode}
            <script type="module">
              try {
                ${jsCode}
              } catch (err) {
                 // Basic error catching and display within the iframe console
                 console.error('[Execution Error]', err);
              }
            </script>
          </body>
        </html>
      `);
    }, DEBOUNCE_TIMEOUT);

    // Cleanup function for the debounce timeout
    // No need to revoke Blob URL anymore
    return () => clearTimeout(timeout);
  }, [htmlCode, cssCode, jsCode]); // Re-run effect if code changes

  return (
    <iframe
      srcDoc={srcDoc}
      title="Preview"
      // Removed 'allow-same-origin' for testing. Keep allow-scripts.
      sandbox="allow-scripts"
      frameBorder="0"
      width="100%"
      height="100%"
      className="bg-white dark:bg-[#161F20]"
    />
  );
};

export default Preview;
