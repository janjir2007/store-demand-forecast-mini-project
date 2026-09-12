import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";
import { IconClose } from "./Icons";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  footer?: ReactNode;
  children: ReactNode;
  /** Blocks escape and backdrop dismissal while a request is in flight. */
  busy?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  footer,
  children,
  busy = false,
}: ModalProps) {
  const panel = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreFocus.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    // Move focus into the dialog so the keyboard lands somewhere sensible.
    const focusable = panel.current?.querySelector<HTMLElement>(
      "input, select, textarea, button:not([disabled])",
    );
    (focusable ?? panel.current)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onClose();
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      restoreFocus.current?.focus();
    };
  }, [open, busy, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="modal-scrim" onMouseDown={() => !busy && onClose()}>
      <div
        ref={panel}
        className={`modal modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal__header">
          <div className="modal__titles">
            <h2>{title}</h2>
            {description && <p className="modal__description">{description}</p>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Хаах"
            icon={<IconClose size={15} />}
            onClick={onClose}
            disabled={busy}
          />
        </header>

        <div className="modal__body">{children}</div>

        {footer && <footer className="modal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
