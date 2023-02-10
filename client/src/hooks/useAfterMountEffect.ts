import { useRef, useEffect, EffectCallback, DependencyList } from "react";

export default function useAfterMountEffect(
  effect: EffectCallback,
  deps?: DependencyList
) {
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) {
      return effect();
    }

    mounted.current = true;
  }, deps);
}
