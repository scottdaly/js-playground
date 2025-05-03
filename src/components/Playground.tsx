import React, { useState, useEffect, useRef } from "react";
import CodeEditor from "./CodeEditor";
import ConsoleOutput from "./ConsoleOutput";
import Header from "./Header";
import { defaultCode } from "../utils/codeExamples";
import ResizablePanel from "./ResizablePanel";
import ConfirmModal from "./ConfirmModal";

const Playground: React.FC = () => {
  const [code, setCode] = useState<string>(defaultCode);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const workerRef = useRef<Worker | null>(null);

  // Load saved code from localStorage on component mount
  useEffect(() => {
    const savedCode = localStorage.getItem("jsPlaygroundCode");
    if (savedCode) {
      setCode(savedCode);
    }
    // Cleanup worker on component unmount
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Save code to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("jsPlaygroundCode", code);
  }, [code]);

  const handleRunCode = () => {
    let initialOutput: string[] = [];
    // Basic static analysis for obvious infinite loops
    const infiniteLoopPattern = /while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)/;
    if (infiniteLoopPattern.test(code)) {
      initialOutput.push(
        "[Warning] Potential infinite loop detected (e.g., while(true) or for(;;)). Execution will proceed but may be terminated if it runs too long or produces excessive output."
      );
    }

    // Terminate existing worker if running
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }

    setIsRunning(true);
    // Prepend static analysis warnings, then add "Running code..."
    setOutput([...initialOutput, "Running code..."]);

    const worker = new Worker("/code-runner.js");
    workerRef.current = worker;

    const timeoutDuration = 5000;
    let workerTimeout: NodeJS.Timeout | null = null;

    const clearWorkerAndTimeout = () => {
      if (workerTimeout) {
        clearTimeout(workerTimeout);
        workerTimeout = null;
      }
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      setIsRunning(false);
    };

    workerTimeout = setTimeout(() => {
      // Prepend initial warnings (if any) to the timeout message
      setOutput([
        ...initialOutput,
        `[Error] Code execution timed out after ${
          timeoutDuration / 1000
        } seconds. Potential infinite loop detected.`,
      ]);
      clearWorkerAndTimeout();
    }, timeoutDuration);

    worker.onmessage = (event) => {
      const { output: workerOutput, error: workerError } = event.data;
      // Prepend initial warnings (if any) to the final output from the worker
      setOutput([...initialOutput, ...(workerOutput || [])]);
      clearWorkerAndTimeout();
    };

    worker.onerror = (error) => {
      console.error("Worker error:", error);
      // Prepend initial warnings (if any) to the worker error message
      setOutput([...initialOutput, `[Error] Worker error: ${error.message}`]);
      clearWorkerAndTimeout();
    };

    worker.postMessage({ code });
  };

  const handleSaveCode = async () => {
    // Check if the File System Access API is supported
    if ("showSaveFilePicker" in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: "script.js",
          types: [
            {
              description: "JavaScript Files",
              accept: { "text/javascript": [".js"] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(code);
        await writable.close();
      } catch (err) {
        // Handle errors, e.g., user cancelling the dialog
        if (err instanceof DOMException && err.name === "AbortError") {
          console.info("Save dialog cancelled by user.");
        } else {
          console.error("Error saving file:", err);
          // Optionally, fallback to the old method here too if needed
          fallbackSave();
        }
      }
    } else {
      // Fallback for browsers that don't support the API
      fallbackSave();
    }
  };

  // Extracted fallback method
  const fallbackSave = () => {
    const blob = new Blob([code], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "script.js"; // Suggested filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the object URL
  };

  const handleClearOutput = () => {
    setOutput([]);
  };

  const openResetConfirmation = () => {
    setIsResetModalOpen(true);
  };

  const confirmResetCode = () => {
    setCode(defaultCode);
    setOutput([]);
    setIsResetModalOpen(false);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-100 dark:bg-zinc-800">
      <Header />

      <div className="flex-grow flex w-full overflow-hidden">
        <ResizablePanel
          direction="horizontal"
          initialSize={50}
          minSize={30}
          maxSize={70}
          leftPanel={
            <CodeEditor
              code={code}
              onChange={setCode}
              onRun={handleRunCode}
              onReset={openResetConfirmation}
              onSave={handleSaveCode}
              isRunning={isRunning}
            />
          }
          rightPanel={
            <ConsoleOutput output={output} onClear={handleClearOutput} />
          }
        />
      </div>

      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={confirmResetCode}
        title="Reset Code?"
        message="Are you sure you want to discard your current code and reset to the default example?"
      />
    </div>
  );
};

export default Playground;
