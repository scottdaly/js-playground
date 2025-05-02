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
              layoutDirection={layoutDirection}
            />
          }
          rightPanel={
            <div className="h-full w-full bg-white dark:bg-[#161F20]">
              <Preview htmlCode={htmlCode} cssCode={cssCode} jsCode={jsCode} />
            </div>
          }
        />
      </div>
    </div>
  );
};

export default WebDevPlayground;
