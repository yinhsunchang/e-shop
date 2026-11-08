import { createPortal } from "react-dom";

interface Modal {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, children }: Modal) {
  if (!open) return null;

  return createPortal(
    <div
      data-testid="modal-backdrop"
      className="modal dark-grey padding"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="modal-content animate-zoom mobile"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
