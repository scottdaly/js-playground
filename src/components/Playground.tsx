import React, { useState, useEffect } from "react";
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

  // Load saved code from localStorage on component mount
  useEffect(() => {
    const savedCode = localStorage.getItem("jsPlaygroundCode");
    if (savedCode) {
      setCode(savedCode);
    }
  }, []);

  // Save code to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("jsPlaygroundCode", code);
  }, [code]);

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput([]);

    // Create a safe console to capture output
    const capturedOutput: string[] = [];

    const safeConsole = {
      log: (...args: any[]) => {
        capturedOutput.push(
          args
            .map((arg) =>
              typeof arg === "object" ? JSON.stringify(arg) : String(arg)
            )
            .join(" ")
        );
      },
      error: (...args: any[]) => {
        capturedOutput.push(
          "[Error] " +
            args
              .map((arg) =>
                typeof arg === "object" ? JSON.stringify(arg) : String(arg)
              )
              .join(" ")
        );
      },
      info: (...args: any[]) => {
        capturedOutput.push(
          "[Info] " +
            args
              .map((arg) =>
                typeof arg === "object" ? JSON.stringify(arg) : String(arg)
              )
              .join(" ")
        );
      },
      warn: (...args: any[]) => {
        capturedOutput.push(
          "[Warning] " +
            args
              .map((arg) =>
                typeof arg === "object" ? JSON.stringify(arg) : String(arg)
              )
              .join(" ")
        );
      },
    };

    try {
      // Create a function from the code string and execute it with the safe console
      const executeCode = new Function("console", code);
      executeCode(safeConsole);
      setOutput(capturedOutput);
    } catch (error) {
      if (error instanceof Error) {
        setOutput([`[Error] ${error.message}`]);
      } else {
        setOutput(["[Error] An unknown error occurred"]);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleClearOutput = () => {
    setOutput([]);
  };

  const openResetConfirmation = () => {
    setIsResetModalOpen(true);
  };

  const confirmResetCode = () => {
    setCode(defaultCode);
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
