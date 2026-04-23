import Modal from "./Modal.jsx";

export default function ConfirmDialog({ open, title = "Are you sure?", message, onCancel, onConfirm }) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm opacity-80">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10">Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 rounded-xl bg-red-500 text-white font-medium hover:opacity-90">
          Delete
        </button>
      </div>
    </Modal>
  );
}
