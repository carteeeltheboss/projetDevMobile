import { useCallback, useEffect, useState } from 'react';

export function useCachedResource(loader, deps = []) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    source: null,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const result = await loader();
      setState({ ...result, loading: false, error: result.error || null });
    } catch (error) {
      setState({ data: null, loading: false, source: null, error });
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}
