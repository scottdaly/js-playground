import React, { useState, useEffect, useRef } from "react";
import {
  PlayIcon,
  CodeBracketIcon,
  ArrowPathIcon,
  StopIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import Editor, { Monaco } from "@monaco-editor/react";
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onReset: () => void;
  onSave: () => void;
  isRunning: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  onRun,
  onReset,
  onSave,
  isRunning,
}) => {
  const [theme, setTheme] = useState("vs-dark");
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
    null
  );
  const monacoRef = useRef<Monaco | null>(null);

  useEffect(() => {
    const updateTheme = () => {
      const currentTheme = document.documentElement.classList.contains("dark")
        ? "custom-dark"
        : "custom-light";
      setTheme(currentTheme);
      monacoRef.current?.editor.setTheme(currentTheme);
    };

    updateTheme();

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
    monacoRef.current = monaco;

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

    const currentTheme = document.documentElement.classList.contains("dark")
      ? "custom-dark"
      : "custom-light";
    monaco.editor.setTheme(currentTheme);
    setTheme(currentTheme);
  };

  const handleFormatCode = async () => {
    await editorRef.current?.getAction("editor.action.formatDocument")?.run();
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#161F20]">
      <div className="relative flex-grow">
        <div className="absolute top-2 right-2 z-10 flex space-x-2">
          <button
            onClick={handleFormatCode}
            className="flex items-center justify-center bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-700 dark:text-zinc-200 p-2 rounded-lg transition-colors duration-200"
            title="Format Code"
            disabled={isRunning}
          >
            <CodeBracketIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onSave}
            className="flex items-center justify-center bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-700 dark:text-zinc-200 p-2 rounded-lg transition-colors duration-200"
            title="Save Code"
            disabled={isRunning}
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onReset}
            className="flex items-center justify-center bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-700 dark:text-zinc-200 p-2 rounded-lg transition-colors duration-200"
            title="Reset Code"
            disabled={isRunning}
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onRun}
            className={`flex items-center space-x-1.5 py-2 px-4 rounded-lg transition-colors duration-200 text-sm font-medium text-white ${
              isRunning
                ? "bg-red-500 hover:bg-red-600"
                : "bg-teal-500 hover:bg-teal-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isRunning ? "Stop Execution" : "Run Code"}
          >
            {isRunning ? (
              <StopIcon className="w-4 h-4" />
            ) : (
              <PlayIcon className="w-4 h-4" />
            )}
            <span>{isRunning ? "Stop" : "Run"}</span>
          </button>
        </div>
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme={theme}
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
