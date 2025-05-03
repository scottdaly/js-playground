import React, { useState, useEffect } from "react";
import Preview from "./Preview";
import Header from "./Header";
import ResizablePanel from "./ResizablePanel";
import WebEditors from "./WebEditors";

// Define localStorage keys
const HTML_STORAGE_KEY = "webDevHtmlCode";
const CSS_STORAGE_KEY = "webDevCssCode";
const JS_STORAGE_KEY = "webDevJsCode";

// Define default code (can be moved to utils if preferred)
const defaultHtml =
  "<h1>Hello World</h1>\n<p>Edit the code to see changes!</p>";
const defaultCss =
  "h1 {\n  color: teal;\n  font-family: sans-serif;\n}\np {\n  color: gray;\n}";
const defaultJs =
  "// Example: Change H1 color after 2 seconds\nsetTimeout(() => {\n  const h1 = document.querySelector('h1');\n  if (h1) {\n    h1.style.color = 'blue';\n    console.log('H1 color changed by JS!');\n  }\n}, 2000);";

// Regex for basic infinite loop detection
const infiniteLoopPattern = /while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)/;

// Type definitions for file types
type CodeType = "html" | "css" | "js";

const WebDevPlayground: React.FC = () => {
  // Initialize state with default values
  const [htmlCode, setHtmlCode] = useState(defaultHtml);
  const [cssCode, setCssCode] = useState(defaultCss);
  const [jsCode, setJsCode] = useState(defaultJs);
  const [layoutDirection, setLayoutDirection] = useState<
    "horizontal" | "vertical"
  >("horizontal");

  // Load saved code from localStorage on mount
  useEffect(() => {
    const savedHtml = localStorage.getItem(HTML_STORAGE_KEY);
    const savedCss = localStorage.getItem(CSS_STORAGE_KEY);
    const savedJs = localStorage.getItem(JS_STORAGE_KEY);

    if (savedHtml) setHtmlCode(savedHtml);
    if (savedCss) setCssCode(savedCss);
    if (savedJs) setJsCode(savedJs);
  }, []); // Empty dependency array ensures this runs only once on mount

  // Save HTML code to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(HTML_STORAGE_KEY, htmlCode);
  }, [htmlCode]);

  // Save CSS code to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(CSS_STORAGE_KEY, cssCode);
  }, [cssCode]);

  // Save JS code to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(JS_STORAGE_KEY, jsCode);
  }, [jsCode]);

  // Function to toggle layout
  const toggleLayout = () => {
    setLayoutDirection((prev) =>
      prev === "horizontal" ? "vertical" : "horizontal"
    );
  };

  // Check for potential infinite loops and prepend warning
  let processedJsCode = jsCode;
  if (infiniteLoopPattern.test(jsCode)) {
    const warningMessage = `console.warn("[Warning] Potential infinite loop detected (e.g., while(true) or for(;;)). Execution might make the preview unresponsive.");\n`;
    processedJsCode = warningMessage + jsCode;
  }

  // Save handler
  const handleSaveCode = async (key: CodeType) => {
    let codeToSave: string;
    let suggestedName: string;
    let mimeType: string;
    let fileExtension: string;

    switch (key) {
      case "html":
        codeToSave = htmlCode;
        suggestedName = "index.html";
        mimeType = "text/html";
        fileExtension = ".html";
        break;
      case "css":
        codeToSave = cssCode;
        suggestedName = "style.css";
        mimeType = "text/css";
        fileExtension = ".css";
        break;
      case "js":
        codeToSave = jsCode;
        suggestedName = "script.js";
        mimeType = "text/javascript";
        fileExtension = ".js";
        break;
    }

    const fallbackSave = () => {
      const blob = new Blob([codeToSave], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = suggestedName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    if ("showSaveFilePicker" in window) {
      try {
        // Define picker options (no explicit type needed here)
        const pickerOpts = {
          suggestedName: suggestedName,
          types: [
            {
              description: `${key.toUpperCase()} File`,
              // Assert types for mimeType and fileExtension
              accept: { [mimeType as string]: [fileExtension as `.${string}`] },
            },
          ],
        };

        const handle = await window.showSaveFilePicker(pickerOpts);
        const writable = await handle.createWritable();
        await writable.write(codeToSave);
        await writable.close();
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          console.info("Save dialog cancelled by user.");
        } else {
          console.error("Error saving file:", err);
          fallbackSave();
        }
      }
    } else {
      fallbackSave();
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-100 dark:bg-zinc-800">
      <Header layoutDirection={layoutDirection} onToggleLayout={toggleLayout} />
      <div className="flex-grow flex w-full overflow-hidden">
        <ResizablePanel
          direction={layoutDirection}
          initialSize={30}
          minSize={20}
          maxSize={80}
          leftPanel={
            <WebEditors
              htmlCode={htmlCode}
              cssCode={cssCode}
              jsCode={jsCode}
              onHtmlChange={setHtmlCode}
              onCssChange={setCssCode}
              onJsChange={setJsCode}
              onSave={handleSaveCode}
              layoutDirection={layoutDirection}
            />
          }
          rightPanel={
            <div className="h-full w-full bg-white dark:bg-[#161F20]">
              <Preview
                htmlCode={htmlCode}
                cssCode={cssCode}
                jsCode={processedJsCode}
              />
            </div>
          }
        />
      </div>
    </div>
  );
};

export default WebDevPlayground;
