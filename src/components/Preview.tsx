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
    const timeout = setTimeout(() => {
      // Create the script content, including the try/catch block
      const scriptContent = `
        try {
          ${jsCode}
        } catch (err) {
          console.error('[Execution Error]', err);
        }
      `;

      // Create a Blob from the script content
      const blob = new Blob([scriptContent], {
        type: "application/javascript",
      });
      const scriptBlobUrl = URL.createObjectURL(blob);

      setSrcDoc(`
        <html>
          <head>
            <meta http-equiv="Content-Security-Policy" content="${iframeCsp}">
            <style>${cssCode}</style>
          </head>
          <body>
            ${htmlCode}
            <script type="module" src="${scriptBlobUrl}"></script>
          </body>
        </html>
      `);

      // Return cleanup function to revoke the Blob URL when the effect re-runs or component unmounts
      return () => {
        URL.revokeObjectURL(scriptBlobUrl);
        clearTimeout(timeout);
      };
    }, DEBOUNCE_TIMEOUT);

    // Also clear the outer timeout if props change before it fires
    return () => clearTimeout(timeout);
  }, [htmlCode, cssCode, jsCode]);

  return (
    <iframe
      srcDoc={srcDoc}
      title="Preview"
      // Keep sandbox strict (allow-scripts is needed)
      sandbox="allow-scripts"
      frameBorder="0"
      width="100%"
      height="100%"
      className="bg-white dark:bg-[#161F20]"
    />
  );
};

export default Preview;
