import { AnimatePresence, motion } from "framer-motion";
import { FolderPlus, Folder, Trash2, Pencil, Box, Moon, Sun, Download, Upload } from "lucide-react";
import { useState } from "react";
import FolderItem from "./FolderItem.jsx";

export default function Sidebar({
  folders,
  selectedId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  onAskNewFolder,
  dark,
  onToggleDark,
  onExport,
  onImport,
}) {
  const [importing, setImporting] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      await onImport(file);
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  return (
    <aside className="w-72 shrink-0 h-full flex flex-col border-r border-black/5 dark:border-white/5 bg-sand/80 dark:bg-nightSidebar/80 backdrop-blur-xl">
      <div className="p-5 flex items-center gap-3">
        <motion.div
          initial={{ rotate: -10, scale: 0.9 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 14 }}
          className="w-10 h-10 grid place-items-center rounded-2xl bg-gradient-to-br from-ink to-nightPrimary text-cream shadow-soft"
        >
          <Box size={20} />
        </motion.div>
        <div>
          <h1 className="font-display text-2xl leading-none">Stash</h1>
          <p className="text-xs opacity-60">your toolbox</p>
        </div>
      </div>

      <div className="px-4">
        <button
          onClick={onAskNewFolder}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-medium bg-ink text-cream dark:bg-nightPrimary dark:text-nightBg hover:opacity-90 transition shadow-soft"
        >
          <FolderPlus size={16} /> New Folder
          <kbd className="ml-2 text-[10px] opacity-70 border border-cream/30 rounded px-1">⌘N</kbd>
        </button>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto scroll-thin px-2 pb-4">
        <AnimatePresence initial={false}>
          {folders.map((f) => (
            <motion.div
              key={f.id}
              layout
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <FolderItem
                folder={f}
                selected={selectedId === f.id}
                onSelect={() => onSelect(f.id)}
                onRename={(name) => onRename(f.id, name)}
                onDelete={() => onDelete(f.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {folders.length === 0 && (
          <div className="text-center text-sm opacity-60 mt-8 px-4">
            <Folder className="mx-auto mb-2 opacity-50" />
            No folders yet. Create one to get started.
          </div>
        )}
      </div>

      <div className="p-4 flex items-center gap-2 border-t border-black/5 dark:border-white/5">
        <button
          onClick={onToggleDark}
          className="grid place-items-center w-9 h-9 rounded-full bg-white/60 dark:bg-white/10 hover:scale-105 transition"
          title="Toggle theme"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          onClick={onExport}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-xs bg-white/60 dark:bg-white/10 hover:scale-[1.02] transition"
        >
          <Download size={14} /> Export
        </button>
        <label className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-xs bg-white/60 dark:bg-white/10 hover:scale-[1.02] transition cursor-pointer">
          <Upload size={14} /> {importing ? "..." : "Import"}
          <input type="file" accept="application/json" onChange={handleFile} className="hidden" />
        </label>
      </div>
    </aside>
  );
}
