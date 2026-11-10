import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { getErrorMessage } from '../utils/apiErrors';

// Results are keyed by query so stale requests never show data from a previous scope.
export function useRemoteResource<P extends object, T>(
  load: (params: P, signal?: AbortSignal) => Promise<T>, params: P,
) {
  const query = JSON.stringify(params);
  const [revision, setRevision] = useState(0);
  const requestKey = `${query}:${revision}`;
  const [result, setResult] = useState<{ key: string; data?: T; error?: string }>();
  useEffect(() => {
    const controller = new AbortController();
    load(JSON.parse(query) as P, controller.signal).then((data) => {
      if (!controller.signal.aborted) setResult({ key: requestKey, data });
    }).catch((error: unknown) => {
      if (!controller.signal.aborted && !axios.isCancel(error)) {
        setResult({ key: requestKey, error: getErrorMessage(error) });
      }
    });
    return () => controller.abort();
  }, [load, query, requestKey]);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  return {
    data: result?.key === requestKey ? result.data : undefined,
    error: result?.key === requestKey ? result.error : undefined,
    loading: result?.key !== requestKey,
    reload,
  };
}
