import { type ReactNode } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

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
  return (
    <Dialog
      open={open}
      onClose={closeOnOverlayClick ? onClose : undefined}
      maxWidth={false}
      PaperProps={{
        sx: {
          maxWidth,
          width: '100%',
          m: 3,
        },
      }}
    >
      {title && (
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '1.125rem',
            fontWeight: 600,
            pb: 0,
          }}
        >
          {title}
          <IconButton
            onClick={onClose}
            size="small"
            aria-label="閉じる"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
      )}

      <DialogContent sx={{ pt: title ? 2.5 : undefined, pb: footer ? 1 : undefined }}>
        {children}
      </DialogContent>

      {footer && (
        <DialogActions sx={{ px: 3, pb: 3 }}>
          {footer}
        </DialogActions>
      )}
    </Dialog>
  );
}
