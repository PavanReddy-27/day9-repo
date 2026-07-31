// ====================================
// File: src/components/common/ConfirmDialog.tsx
// ====================================

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={!loading ? onCancel : undefined}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <DialogContentText>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onCancel}
          disabled={loading}
        >
          {cancelText}
        </Button>

        <Button
          variant="contained"
          color={danger ? "error" : "primary"}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress
              size={20}
              color="inherit"
            />
          ) : (
            confirmText
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;