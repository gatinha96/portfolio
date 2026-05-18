import { useEffect, useRef, useState } from "react";

export default function AnimatedCollapse({
  open,
  children,
  className = "",
  contentClassName = "",
}) {
  const [isMounted, setIsMounted] = useState(open);
  const [isExpanded, setIsExpanded] = useState(open);
  const frameRef = useRef(null);

  useEffect(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    if (open) {
      setIsMounted(true);
      frameRef.current = requestAnimationFrame(() => {
        setIsExpanded(true);
        frameRef.current = null;
      });
    } else {
      setIsExpanded(false);
    }

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [open]);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
        isExpanded
          ? "grid-rows-[1fr] opacity-100"
          : "grid-rows-[0fr] opacity-0 pointer-events-none"
      } ${className}`}
      aria-hidden={!isExpanded}
      inert={!isExpanded ? "" : undefined}
      onTransitionEnd={(event) => {
        if (event.target !== event.currentTarget || event.propertyName !== "grid-template-rows") {
          return;
        }

        if (!open) {
          setIsMounted(false);
        }
      }}
    >
      <div className={`min-h-0 overflow-hidden ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
}