import type { Toast } from "../../hooks/useToast";
import { IconCheck, IconAlert, IconClose } from "./Icons";

interface ToastStackProps {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (!toasts.length) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.tone}`}>
          <span className="toast__icon">
            {toast.tone === "success" ? <IconCheck size={14} /> : <IconAlert size={15} />}
          </span>
          <span className="toast__message">{toast.message}</span>
          <button className="toast__close" aria-label="Хаах" onClick={() => onDismiss(toast.id)}>
            <IconClose size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
