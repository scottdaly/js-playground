import React, { useState, useEffect } from "react";

interface PreviewProps {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
}

// Timeout duration for debouncing updates
const DEBOUNCE_TIMEOUT = 250; // 250ms

// Define the iframe's Content Security Policy
// Allow blob: for script-src to load the generated script blob
const iframeCsp =
  "default-src 'none'; script-src 'unsafe-inline' blob:; style-src 'unsafe-inline'; connect-src 'none'; frame-ancestors 'none';";

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
      // Re-adding 'allow-same-origin' as loading blob: scripts might require non-opaque origin.
      sandbox="allow-scripts allow-same-origin"
      frameBorder="0"
      width="100%"
      height="100%"
      className="bg-white dark:bg-[#161F20]"
    />
  );
};

export default Preview;
