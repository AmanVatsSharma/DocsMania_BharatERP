import React from "react";

export function useDebouncedCallback<T extends (...args: any[]) => void>(fn: T, delayMs: number) {
  const timer = React.useRef<NodeJS.Timeout | null>(null);
  return React.useCallback(
    (...args: Parameters<T>) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), delayMs);
    },
    [fn, delayMs]
  );
}


