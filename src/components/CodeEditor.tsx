import React, { useState, useEffect, useRef } from "react";
import {
  PlayIcon,
  CodeBracketIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import Editor, { Monaco } from "@monaco-editor/react";
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onReset: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  onRun,
  onReset,
}) => {
  const [theme, setTheme] = useState("vs-dark");
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
    null
  );

  useEffect(() => {
    const currentTheme = document.documentElement.classList.contains("dark")
      ? "custom-dark"
      : "light";
    setTheme(currentTheme);

    // Optional: Observe class changes on documentElement if needed
    // This ensures the editor theme updates if the theme is changed elsewhere
    const observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const newTheme = document.documentElement.classList.contains("dark")
            ? "custom-dark"
            : "light";
          setTheme(newTheme);
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect(); // Cleanup observer on unmount
  }, []);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  const handleEditorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    editorRef.current = editor;

    // Define a custom dark theme inheriting from vs-dark
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark", // inherit from vs-dark
      inherit: true, // inherit rules and colors
      rules: [], // Add custom token color rules if needed
      colors: {
        // Override the editor background color
        "editor.background": "#161F20",
      },
    });

    // Re-apply the theme after defining custom-dark to handle initial load
    const currentTheme = document.documentElement.classList.contains("dark")
      ? "custom-dark"
      : "light";
    monaco.editor.setTheme(currentTheme);
    // We also update our state, although Monaco's internal state is what matters here
    setTheme(currentTheme);

    // You can add other mount logic here if needed
  };

  const handleFormatCode = async () => {
    await editorRef.current?.getAction("editor.action.formatDocument")?.run();
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-teal-800">
      <div className="relative flex-grow">
        <div className="absolute top-2 right-2 z-10 flex space-x-2">
          <button
            onClick={handleFormatCode}
            className="flex items-center space-x-2 bg-gray-300 dark:bg-teal-800/60 bg-opacity-80 dark:hover:bg-teal-800/80 text-black dark:text-white py-3 px-4 rounded-xl transition-colors duration-200 text-xs backdrop-blur-sm"
            title="Format"
          >
            <CodeBracketIcon className="w-4 h-4" strokeWidth="4" />
          </button>
          <button
            onClick={onReset}
            className="flex items-center space-x-2 bg-gray-300 dark:bg-teal-800/60 bg-opacity-80 dark:hover:bg-teal-800/80 text-black dark:text-white py-3 px-4 rounded-xl transition-colors duration-200 text-xs backdrop-blur-sm"
            title="Reset"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onRun}
            className="flex items-center space-x-1.5 bg-teal-400 bg-opacity-80 hover:bg-teal-500 text-black py-3 px-5 rounded-xl transition-colors duration-200 text-sm backdrop-blur-sm disabled:opacity-50"
            title="Run"
          >
            <PlayIcon className="w-4 h-4" />
            <span>Run</span>
          </button>
        </div>
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme={theme} // Dynamically set theme
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineHeight: 17,
            lineNumbers: "on",
            lineNumbersMinChars: 4,
            glyphMargin: false,
            roundedSelection: false,
            lineDecorationsWidth: 0,
            scrollBeyondLastLine: false,
            automaticLayout: true,
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
              vertical: "hidden",
              horizontal: "auto",
            },
            overviewRulerLanes: 0,
            padding: { top: 8 },
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
