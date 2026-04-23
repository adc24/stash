import { useEffect, useState } from "react";
import Modal from "./Modal.jsx";

export default function NewFolderModal({ open, onClose, onSubmit }) {
  const [name, setName] = useState("");

  useEffect(() => { if (!open) setName(""); }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit(name.trim());
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New folder">
      <form onSubmit={submit} className="space-y-4">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Design inspiration"
          className="w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 outline-none focus:border-ink dark:focus:border-nightPrimary"
        />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 rounded-xl bg-ink text-cream dark:bg-nightPrimary dark:text-nightBg font-medium hover:opacity-90">
            Create
          </button>
        </div>
      </form>
    </Modal>
  );
}
