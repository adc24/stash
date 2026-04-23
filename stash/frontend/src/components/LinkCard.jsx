import { motion } from "framer-motion";
import { Copy, Pencil, Trash2, Globe, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

function faviconUrl(url) {
  try {
    const u = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
  } catch {
    return null;
  }
}

export default function LinkCard({ link, onEdit, onDelete, onTagClick }) {
  const tags = (link.tags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const copy = async (e) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(link.url);
    toast.success("URL copied");
  };

  const open = () => window.open(link.url, "_blank", "noopener,noreferrer");
  const fav = faviconUrl(link.url);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ y: -4 }}
      onClick={open}
      className="glass group relative cursor-pointer rounded-2xl p-4 border border-black/5 dark:border-white/5 shadow-soft overflow-hidden"
    >
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition" />
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 grid place-items-center shrink-0 overflow-hidden border border-black/5 dark:border-white/10">
          {fav ? (
            <img
              src={fav}
              alt=""
              className="w-6 h-6"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ) : (
            <Globe size={18} className="opacity-60" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-display font-semibold truncate">{link.name}</h3>
            <ExternalLink size={12} className="opacity-40 shrink-0" />
          </div>
          <p className="text-xs opacity-60 truncate">{link.url}</p>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={(e) => { e.stopPropagation(); onTagClick?.(t); }}
                  className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full bg-accent/15 text-accent hover:bg-accent/25 transition"
                >
                  #{t}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition flex flex-col gap-1">
          <button onClick={copy} className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10" title="Copy URL">
            <Copy size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(link); }}
            className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(link); }}
            className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
