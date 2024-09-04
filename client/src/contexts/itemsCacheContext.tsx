import { createContext, useContext, useEffect, useRef, useState } from "react";

export interface CacheContextI {
  cache: Record<string, any>;
  updateCache: (key: string, value: any) => void;
}

export const CacheContext = createContext<CacheContextI>({
  cache: {},
  updateCache: () => {},
});

export const CacheContextProvider = (props: { children: React.ReactNode }) => {
  const [cache, setCache] = useState<Record<string, any>>({});

  const updateCache = (key: string, value: any) => {
    setCache((prevCache) => ({
      ...prevCache,
      [key]: value,
    }));
  };

  return (
    <CacheContext.Provider value={{ cache, updateCache }}>
      {props.children}
    </CacheContext.Provider>
  );
};

export const useCache = () => {
  return useContext(CacheContext);
};

export function useCachedState<T>(key: string, initialValue: T) {
  const { cache, updateCache } = useCache();

  const [state, setState] = useState<T>(() => {
    return cache[key] !== undefined ? cache[key] : initialValue;
  });

  const previousKeyRef = useRef(key);

  useEffect(() => {
    if (previousKeyRef.current !== key) {
      const newState = cache[key] !== undefined ? cache[key] : initialValue;
      setState(newState);
      previousKeyRef.current = key;
    }
  }, [key, cache, initialValue]);

  useEffect(() => {
    if (cache[key] !== state) updateCache(key, state);
  }, [key, state, updateCache, cache]);

  return [state, setState] as const;
}
