import React, { useState, useEffect } from "react";

interface PreviewProps {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
}

const Preview: React.FC<PreviewProps> = ({ htmlCode, cssCode, jsCode }) => {
  const [srcDoc, setSrcDoc] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
        <html>
          <head>
            <style>${cssCode}</style>
          </head>
          <body>
            ${htmlCode}
            <script>${jsCode}</script>
          </body>
        </html>
      `);
    }, 250); // Debounce update by 250ms

    // Clear timeout if props change before delay is up
    return () => clearTimeout(timeout);
  }, [htmlCode, cssCode, jsCode]); // Re-run effect if code changes

  return (
    <iframe
      srcDoc={srcDoc}
      title="Preview"
      sandbox="allow-scripts" // Allows scripts but restricts other potentially harmful actions
      frameBorder="0"
      width="100%"
      height="100%"
      className="bg-white" // Ensure a white background for the iframe content area
    />
  );
};

export default Preview;
