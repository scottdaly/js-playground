import React, { useState, useEffect, useRef } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import {
  ChevronDownIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid"; // Import icons
import ResizablePanel from "./ResizablePanel"; // Import ResizablePanel

// Define sensible min/max percentages for maximizing/minimizing
const MIN_PANEL_PERCENT = 10; // Smallest percentage for a "collapsed" pane
const MAX_PANEL_PERCENT = 100 - MIN_PANEL_PERCENT * 2; // Max for one pane leaving min for two others
const INNER_MAX_PERCENT = 100 - MIN_PANEL_PERCENT;
const INNER_MIN_PERCENT = MIN_PANEL_PERCENT;

interface WebEditorsProps {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  onHtmlChange: (value: string) => void;
  onCssChange: (value: string) => void;
  onJsChange: (value: string) => void;
  onSave: (key: "html" | "css" | "js") => void;
  layoutDirection: "horizontal" | "vertical"; // Add prop for parent layout
}

const editorOptions: monacoEditor.editor.IStandaloneEditorConstructionOptions =
  {
    minimap: { enabled: false },
    fontSize: 14,
    lineHeight: 17,
    lineNumbers: "on",
    lineNumbersMinChars: 4,
    glyphMargin: false,
    roundedSelection: false,
    lineDecorationsWidth: 0,
    scrollBeyondLastLine: false,
    automaticLayout: true, // Ensures editor resizes correctly
    tabSize: 2,
    wordWrap: "on",
    wrappingIndent: "indent",
    formatOnPaste: true,
    formatOnType: true,
    showUnused: true,
    guides: {
      indentation: false,
    },
    renderLineHighlight: "none",
    scrollbar: {
      vertical: "auto", // Keep vertical scrollbar
      horizontal: "auto",
    },
    overviewRulerLanes: 0,
    padding: { top: 8 },
  };

// Reusable component for a single editor pane
const EditorPane: React.FC<{
  title: string;
  language: string;
  value: string;
  onChange: (value: string) => void;
  theme: string;
  onMount: (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => void;
  editorKey: "html" | "css" | "js"; // Add key to identify the editor
  currentlyMaximized: "html" | "css" | "js" | null;
  onToggleMaximize: (key: "html" | "css" | "js") => void;
  onSave: (key: "html" | "css" | "js") => void;
}> = ({
  title,
  language,
  value,
  onChange,
  theme,
  onMount,
  editorKey,
  currentlyMaximized,
  onToggleMaximize,
  onSave,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
    null
  );
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for the dropdown

  const handleFormatCode = () => {
    editorRef.current?.getAction("editor.action.formatDocument")?.run();
    setIsDropdownOpen(false); // Close dropdown after action
  };

  const handleSave = () => {
    onSave(editorKey);
    setIsDropdownOpen(false); // Close dropdown after action
  };

  const handleFullscreen = () => {
    // Placeholder for fullscreen logic
    console.log(`Fullscreen toggled for ${title}`);
    onToggleMaximize(editorKey);
    setIsDropdownOpen(false); // Close dropdown after action
  };

  const handleEditorPaneMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    editorRef.current = editor;
    onMount(editor, monaco); // Call the original onMount prop
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const isMaximized = currentlyMaximized === editorKey;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white dark:bg-[#161F20]">
      <div
        className={`relative flex justify-between items-center py-2 px-4 bg-white dark:bg-[#161F20] text-gray-700 dark:text-zinc-300 text-sm font-semibold`}
      >
        <span>{title}</span>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
            aria-label="Editor options"
          >
            <ChevronDownIcon className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-zinc-700 rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
              <button
                onClick={handleFormatCode}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-600"
              >
                Format Code
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-600"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Save File
              </button>
              <button
                onClick={handleFullscreen}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-600"
              >
                {isMaximized ? (
                  <ArrowsPointingInIcon className="h-4 w-4" />
                ) : (
                  <ArrowsPointingOutIcon className="h-4 w-4" />
                )}
                {isMaximized ? "Minimize" : "Maximize"}
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Editor body is always rendered now */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          theme={theme}
          value={value}
          onChange={(val) => onChange(val || "")}
          onMount={handleEditorPaneMount} // Use the new mount handler
          options={editorOptions}
        />
      </div>
    </div>
  );
};

const WebEditors: React.FC<WebEditorsProps> = ({
  htmlCode,
  cssCode,
  jsCode,
  onHtmlChange,
  onCssChange,
  onJsChange,
  layoutDirection,
  onSave,
}) => {
  const [theme, setTheme] = useState("vs-dark");
  const monacoRef = useRef<Monaco | null>(null);
  const [maximizedEditor, setMaximizedEditor] = useState<
    "html" | "css" | "js" | null
  >(null);

  // Default/initial sizes
  const initialOuterSize = 33;
  const initialInnerSize = 50;

  // State for panel sizes
  const [outerPanelSize, setOuterPanelSize] = useState(initialOuterSize);
  const [innerPanelSize, setInnerPanelSize] = useState(initialInnerSize);
  const [previousSizes, setPreviousSizes] = useState<[number, number] | null>(
    null
  );

  // Theme synchronization logic (similar to CodeEditor.tsx)
  useEffect(() => {
    const updateTheme = () => {
      const currentTheme = document.documentElement.classList.contains("dark")
        ? "custom-dark"
        : "custom-light";
      setTheme(currentTheme);
      // Also update Monaco's theme directly if it's already mounted
      monacoRef.current?.editor.setTheme(currentTheme);
    };

    updateTheme(); // Set initial theme

    const observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          updateTheme();
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const handleEditorDidMount = (
    _editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    monacoRef.current = monaco; // Store monaco instance

    // Define custom dark theme if not already defined
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#161F20",
        "editorLineNumber.foreground": "#565656",
        "editorLineNumber.activeForeground": "#858585",
      },
    });

    monaco.editor.defineTheme("custom-light", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#FFFFFF",
        "editorLineNumber.foreground": "#c1c1c1",
        "editorLineNumber.activeForeground": "#868686",
      },
    });

    // Ensure the theme is correctly applied after mount
    const currentTheme = document.documentElement.classList.contains("dark")
      ? "custom-dark"
      : "custom-light";
    monaco.editor.setTheme(currentTheme);
    setTheme(currentTheme); // Update state just in case
  };

  const handleToggleMaximize = (key: "html" | "css" | "js") => {
    setMaximizedEditor((prevMaximized) => {
      if (prevMaximized === key) {
        // Minimize: Restore previous sizes if available, else reset
        if (previousSizes) {
          setOuterPanelSize(previousSizes[0]);
          setInnerPanelSize(previousSizes[1]);
        } else {
          setOuterPanelSize(initialOuterSize);
          setInnerPanelSize(initialInnerSize);
        }
        setPreviousSizes(null);
        return null; // No editor is maximized
      } else {
        // Maximize: Store current sizes and set new ones
        setPreviousSizes([outerPanelSize, innerPanelSize]);
        let targetOuterSize = outerPanelSize;
        let targetInnerSize = innerPanelSize;

        if (key === "html") {
          targetOuterSize = MAX_PANEL_PERCENT;
          // Optional: Reset inner panel ratio when maximizing HTML?
          // targetInnerSize = initialInnerSize;
        } else {
          // Maximizing CSS or JS
          targetOuterSize = MIN_PANEL_PERCENT;
          targetInnerSize =
            key === "css" ? INNER_MAX_PERCENT : INNER_MIN_PERCENT;
        }

        setOuterPanelSize(targetOuterSize);
        setInnerPanelSize(targetInnerSize);
        return key; // This editor is now maximized
      }
    });
  };

  // Determine the direction for the nested panels
  const nestedPanelDirection =
    layoutDirection === "horizontal" ? "vertical" : "horizontal";

  // No longer conditionally rendering based on maximizedEditor
  // The structure is always the same nested ResizablePanels

  return (
    <ResizablePanel
      direction={nestedPanelDirection}
      initialSize={initialOuterSize} // Keep for initial render
      size={outerPanelSize} // Control the size
      onSizeChange={setOuterPanelSize} // Update state on drag
      minSize={MIN_PANEL_PERCENT}
      maxSize={MAX_PANEL_PERCENT}
      leftPanel={
        <EditorPane
          title="HTML"
          language="html"
          value={htmlCode}
          onChange={onHtmlChange}
          theme={theme}
          onMount={handleEditorDidMount}
          editorKey="html"
          currentlyMaximized={maximizedEditor}
          onToggleMaximize={handleToggleMaximize}
          onSave={onSave}
        />
      }
      rightPanel={
        <ResizablePanel
          direction={nestedPanelDirection}
          initialSize={initialInnerSize} // Keep for initial render
          size={innerPanelSize} // Control the size
          onSizeChange={setInnerPanelSize} // Update state on drag
          minSize={INNER_MIN_PERCENT} // Use specific inner min/max
          maxSize={INNER_MAX_PERCENT}
          leftPanel={
            <EditorPane
              title="CSS"
              language="css"
              value={cssCode}
              onChange={onCssChange}
              theme={theme}
              onMount={handleEditorDidMount}
              editorKey="css"
              currentlyMaximized={maximizedEditor}
              onToggleMaximize={handleToggleMaximize}
              onSave={onSave}
            />
          }
          rightPanel={
            <EditorPane
              title="JavaScript"
              language="javascript"
              value={jsCode}
              onChange={onJsChange}
              theme={theme}
              onMount={handleEditorDidMount}
              editorKey="js"
              currentlyMaximized={maximizedEditor}
              onToggleMaximize={handleToggleMaximize}
              onSave={onSave}
            />
          }
        />
      }
    />
  );
};

export default WebEditors;
