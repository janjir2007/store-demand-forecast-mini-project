import type { ReactNode } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
  error?: string | null;
  children: ReactNode;
}

/** Destructive confirmation. The body should spell out what is lost. */
export function ConfirmDialog({
  open,
  title,
  confirmLabel,
  onConfirm,
  onCancel,
  busy = false,
  error,
  children,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      busy={busy}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            Цуцлах
          </Button>
          <Button variant="primary" danger onClick={onConfirm} loading={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="confirm">
        {children}
        {error && <p className="inline-error">{error}</p>}
      </div>
    </Modal>
  );
}
