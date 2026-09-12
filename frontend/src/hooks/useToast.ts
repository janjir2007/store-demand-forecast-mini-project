import { useCallback, useEffect, useRef, useState } from "react";

export interface Toast {
  id: number;
  tone: "success" | "error";
  message: string;
}

const DURATION = 4000;

/** Transient success/error feedback for actions that leave no visible trace. */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (tone: Toast["tone"], message: string) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, tone, message }]);
      timers.current.push(setTimeout(() => dismiss(id), DURATION));
    },
    [dismiss],
  );

  return { toasts, dismiss, success: (m: string) => push("success", m), error: (m: string) => push("error", m) };
}
