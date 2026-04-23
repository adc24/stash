import { useEffect, useState } from "react";
import Modal from "./Modal.jsx";

// Mirror of backend auto-name logic so the user gets live preview.
const overrides = {
  "drive.google.com": "Google Drive",
  "docs.google.com": "Google Docs",
  "github.com": "GitHub",
  "notion.so": "Notion",
  "www.notion.so": "Notion",
  "figma.com": "Figma",
  "youtube.com": "YouTube",
  "youtu.be": "YouTube",
};

function autoName(url) {
  try {
    const u = new URL(url.includes("://") ? url : `https://${url}`);
    const h = u.hostname.toLowerCase();
    if (overrides[h]) return overrides[h];
    const noWww = h.startsWith("www.") ? h.slice(4) : h;
    if (overrides[noWww]) return overrides[noWww];
    const first = noWww.split(".")[0];
    return first ? first[0].toUpperCase() + first.slice(1) : "New Link";
  } catch {
    return "";
  }
}

export default function AddLinkModal({ open, onClose, onSubmit }) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [tags, setTags] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) { setUrl(""); setName(""); setTags(""); setTouched(false); }
  }, [open]);

  useEffect(() => {
    if (!touched) setName(autoName(url));
  }, [url, touched]);

  const submit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    await onSubmit({ url: url.trim(), name: name.trim(), tags: tags.trim() });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add link">
      <form onSubmit={submit} className="space-y-4">
        <Field label="URL" required>
          <input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://figma.com"
            className="input"
          />
        </Field>
        <Field label="Name (auto-generated)">
          <input
            value={name}
            onChange={(e) => { setTouched(true); setName(e.target.value); }}
            placeholder="My link"
            className="input"
          />
        </Field>
        <Field label="Tags (comma separated)">
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="design, inspiration"
            className="input"
          />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10">
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-ink text-cream dark:bg-nightPrimary dark:text-nightBg font-medium hover:opacity-90"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wide opacity-70">
        {label} {required && <span className="text-accent">*</span>}
      </span>
      <div className="mt-1">{children}</div>
      <style>{`.input{width:100%;padding:.6rem .8rem;border-radius:.85rem;background:rgba(255,255,255,.7);border:1px solid rgba(0,0,0,.08);outline:none;transition:.15s}
      .input:focus{border-color:#0B3B3A;box-shadow:0 0 0 3px rgba(11,59,58,.12)}
      .dark .input{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1);color:#e6e8eb}
      .dark .input:focus{border-color:#4DB6AC;box-shadow:0 0 0 3px rgba(77,182,172,.2)}`}</style>
    </label>
  );
}
