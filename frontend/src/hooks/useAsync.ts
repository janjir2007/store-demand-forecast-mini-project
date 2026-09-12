import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "../lib/api";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface AsyncResult<T> extends AsyncState<T> {
  reload: () => void;
}

/** Runs a fetcher on mount, exposing loading/error/data plus a retry handle. */
export function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[] = []): AsyncResult<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });
  const [nonce, setNonce] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let active = true;
    setState((previous) => ({ ...previous, loading: true, error: null }));

    fetcherRef
      .current()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!active) return;
        // A 401 is handled globally by the auth provider; no need to shout here.
        const message = error instanceof ApiError ? error.message : "Алдаа гарлаа.";
        setState({ data: null, loading: false, error: message });
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((value) => value + 1), []);
  return { ...state, reload };
}
