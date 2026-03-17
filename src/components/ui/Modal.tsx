import { useEffect, useRef, useCallback, type ReactNode } from 'react';

interface ModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** Modal title */
  title?: ReactNode;
  /** Footer content (typically buttons) */
  footer?: ReactNode;
  /** Max width of the modal container */
  maxWidth?: string;
  /** Whether clicking the overlay closes the modal */
  closeOnOverlayClick?: boolean;
  children: ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  footer,
  maxWidth = '480px',
  closeOnOverlayClick = true,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Sync open state with dialog element
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Handle Escape key (native dialog behavior)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  // Handle overlay click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnOverlayClick && contentRef.current && !contentRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose],
  );

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className={[
        'fixed inset-0 z-[var(--z-modal)] m-0 p-0 w-full h-full max-w-none max-h-none',
        'bg-transparent backdrop:bg-transparent',
        // We handle overlay ourselves for animation control
      ].join(' ')}
      onClick={handleBackdropClick}
      aria-modal="true"
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-[var(--bg-overlay)] animate-[fadeIn_200ms_ease-out]" />

      {/* Centering container */}
      <div className="fixed inset-0 flex items-center justify-center p-6">
        {/* Modal content */}
        <div
          ref={contentRef}
          className="relative w-full bg-[var(--bg-elevated)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-xl)] animate-[scaleIn_200ms_ease-out]"
          style={{ maxWidth }}
          role="document"
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 pt-6 pb-0">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="閉じる"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-5 text-sm text-[var(--text-secondary)]">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-2 px-6 pb-6 pt-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}

// Keyframe animations (add to globals.css or inline)
// These are defined as Tailwind arbitrary animations above
// @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
// @keyframes scaleIn { from { opacity: 0; transform: scale(0.96) } to { opacity: 1; transform: scale(1) } }
