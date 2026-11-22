"use client";

import { useEffect, useId, useRef } from "react";
import { Button } from "./Button";

interface ModalDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Reusable accessible modal dialog built on native `<dialog>` + `showModal()`.
 */
export function ModalDialog({
  open,
  title,
  onClose,
  children,
}: ModalDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const pressedOutsideRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const isOutside = (e: React.PointerEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return false;
    const rect = dialog.getBoundingClientRect();
    return (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    );
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onPointerDown={(e) => {
        pressedOutsideRef.current = isOutside(e);
      }}
      onPointerUp={(e) => {
        if (pressedOutsideRef.current && isOutside(e)) {
          onClose();
        }
        pressedOutsideRef.current = false;
      }}
      className="m-auto w-[min(92vw,540px)] rounded-[20px] border border-border bg-surface p-6 text-text shadow-modal"
    >
      <h2 id={titleId} className="text-xl font-bold text-text">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={onClose} autoFocus>
          Close
        </Button>
      </div>
    </dialog>
  );
}
