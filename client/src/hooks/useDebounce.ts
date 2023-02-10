import { useEffect, useState } from "react";

export default function useDebounce<S>(value: S, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState<S>(value);

  useEffect(() => {
    const handler: NodeJS.Timeout = setTimeout(
      () => setDebouncedValue(value),
      delay
    );
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
