import Modal from './Modal';

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onClose,
  busy = false,
  danger = true,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={busy ? () => {} : onClose}
      maxWidth="max-w-md"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-[#17211D] hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-colors ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#831843] hover:bg-[#9F1239]'}`}
          >
            {busy ? 'Working...' : confirmLabel}
          </button>
        </div>
      }
    >
      <p className="text-sm text-[#6B756F] leading-relaxed">{message}</p>
    </Modal>
  );
}
