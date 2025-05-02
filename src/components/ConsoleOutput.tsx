import React, { useRef, useEffect } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";

interface ConsoleOutputProps {
  output: string[];
  onClear: () => void;
}

const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ output, onClear }) => {
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="h-full flex flex-col">
      <div
        ref={outputRef}
        className="relative flex-grow p-4 overflow-auto bg-white dark:bg-[#161F20] text-gray-800 dark:text-white font-mono text-sm"
      >
        <button
          onClick={onClear}
          className="absolute top-2 right-2 z-10 px-3 py-3 bg-gray-300 dark:bg-teal-800/60 bg-opacity-60 hover:bg-teal-800/80 text-gray-800 dark:text-gray-200 hover:text-white rounded-lg transition-colors duration-200 backdrop-blur-sm"
          title="Clear Console"
        >
          <TrashIcon className="w-4 h-4" />
        </button>

        {output.length === 0 ? (
          <div className="text-zinc-700/50 dark:text-zinc-200/50 italic">
            Run your code to see output here
          </div>
        ) : (
          output.map((line, index) => (
            <div
              key={index}
              className={`py-1 font-sans text-lg ${
                line.includes("[Error]")
                  ? "text-red-600 dark:text-red-400"
                  : line.includes("[Info]")
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-black dark:text-white"
              }`}
            >
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConsoleOutput;
