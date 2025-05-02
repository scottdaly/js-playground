import React, { useState, useEffect, useCallback, useRef } from "react";

interface ResizablePanelProps {
  direction: "horizontal" | "vertical";
  initialSize: number; // percentage
  size?: number; // Controlled size percentage
  onSizeChange?: (newSize: number) => void; // Callback for size changes
  minSize?: number; // minimum percentage
  maxSize?: number; // maximum percentage
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  direction,
  initialSize,
  size,
  onSizeChange,
  minSize = 20,
  maxSize = 80,
  leftPanel,
  rightPanel,
}) => {
  const [internalSize, setInternalSize] = useState(initialSize);
  const [resizing, setResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSize = size !== undefined ? size : internalSize;

  useEffect(() => {
    if (size !== undefined && size !== internalSize) {
      const clampedSize = Math.max(minSize, Math.min(maxSize, size));
      setInternalSize(clampedSize);
    }
    // Only react to changes in the 'size' prop itself
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, minSize, maxSize]); // Add min/maxSize dependencies

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setResizing(true);
  }, []);

  const stopResize = useCallback(() => {
    setResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (resizing && containerRef.current) {
        const container = containerRef.current;

        const { left, top, width, height } = container.getBoundingClientRect();

        let newSize;
        if (direction === "horizontal") {
          newSize = ((e.clientX - left) / width) * 100;
        } else {
          newSize = ((e.clientY - top) / height) * 100;
        }

        // Clamp the size between minSize and maxSize
        newSize = Math.max(minSize, Math.min(maxSize, newSize));

        // Update internal state if not controlled
        if (size === undefined) {
          setInternalSize(newSize);
        }
        // Always call the callback if provided
        if (onSizeChange) {
          onSizeChange(newSize);
        }
      }
    },
    [resizing, direction, minSize, maxSize, size, onSizeChange]
  );

  useEffect(() => {
    if (resizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResize);
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResize);
    }

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResize);
    };
  }, [resizing, resize, stopResize]);

  return (
    <div
      ref={containerRef}
      className={`flex ${
        direction === "horizontal" ? "flex-row" : "flex-col"
      } h-full w-full overflow-hidden`}
    >
      <div
        className={`${
          direction === "horizontal" ? "h-full" : "w-full"
        } overflow-auto`}
        style={{
          flexBasis: `${currentSize}%`,
          [direction === "horizontal"
            ? "minWidth"
            : "minHeight"]: `${minSize}%`,
          [direction === "horizontal"
            ? "maxWidth"
            : "maxHeight"]: `${maxSize}%`,
        }}
      >
        {leftPanel}
      </div>

      <div
        className={`
          flex-shrink-0
          ${
            direction === "horizontal"
              ? "w-1.5 cursor-col-resize h-full"
              : "h-1.5 cursor-row-resize w-full"
          } 
          bg-gray-100 dark:bg-teal-700/25
          transition-colors duration-200
          flex items-center justify-center`}
        onMouseDown={startResize}
      >
        <div
          className={`flex ${
            direction === "horizontal" ? "flex-col" : "flex-row"
          } gap-1`}
        ></div>
      </div>

      <div
        className={`${
          direction === "horizontal" ? "h-full" : "w-full"
        } flex-1 overflow-auto`}
      >
        {rightPanel}
      </div>
    </div>
  );
};

export default ResizablePanel;
