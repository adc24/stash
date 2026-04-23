import { useEffect, useState } from "react";
import Modal from "./Modal.jsx";

export default function EditLinkModal({ open, link, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (link) {
      setName(link.name || "");
      setUrl(link.url || "");
      setTags(link.tags || "");
    }
  }, [link]);

  const submit = async (e) => {
    e.preventDefault();
    await onSubmit({ name: name.trim(), url: url.trim(), tags: tags.trim() });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit link">
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="text-xs uppercase tracking-wide opacity-70">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input mt-1" />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide opacity-70">URL</span>
          <input value={url} onChange={(e) => setUrl(e.target.value)} className="input mt-1" />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide opacity-70">Tags</span>
          <input value={tags} onChange={(e) => setTags(e.target.value)} className="input mt-1" />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 rounded-xl bg-ink text-cream dark:bg-nightPrimary dark:text-nightBg font-medium hover:opacity-90">
            Save
          </button>
        </div>
        <style>{`.input{width:100%;padding:.6rem .8rem;border-radius:.85rem;background:rgba(255,255,255,.7);border:1px solid rgba(0,0,0,.08);outline:none}
        .dark .input{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1);color:#e6e8eb}`}</style>
      </form>
    </Modal>
  );
}
