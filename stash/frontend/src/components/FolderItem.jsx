import { Folder, Pencil, Trash2, Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function FolderItem({ folder, selected, onSelect, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(folder.name);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const save = async () => {
    const v = value.trim();
    if (v && v !== folder.name) await onRename(v);
    setEditing(false);
  };

  return (
    <div
      onClick={onSelect}
      onDoubleClick={() => setEditing(true)}
      className={`group flex items-center gap-2 px-3 py-2 my-0.5 rounded-xl cursor-pointer transition
        ${
          selected
            ? "bg-ink text-cream dark:bg-nightPrimary dark:text-nightBg shadow-soft"
            : "hover:bg-white/70 dark:hover:bg-white/5"
        }`}
    >
      <Folder size={16} className="shrink-0" />
      {editing ? (
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") {
              setValue(folder.name);
              setEditing(false);
            }
          }}
          className="flex-1 bg-transparent outline-none text-sm"
        />
      ) : (
        <span className="flex-1 truncate text-sm">{folder.name}</span>
      )}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition">
        {editing ? (
          <>
            <button onClick={(e) => { e.stopPropagation(); save(); }} className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10">
              <Check size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setValue(folder.name);
                setEditing(false);
              }}
              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setEditing(true); }}
              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
