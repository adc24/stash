import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";

export default function BookmarkletCard() {
  // Drag-to-bookmarks-bar snippet. Uses current origin so it works wherever Stash is hosted.
  const code = `javascript:(function(){var u=encodeURIComponent(location.href),t=encodeURIComponent(document.title);window.open('${typeof window !== "undefined" ? window.location.origin : ""}/api/bookmarklet?url='+u+'&title='+t,'_blank','width=400,height=300');})();`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 border border-black/5 dark:border-white/5 flex items-center gap-3"
    >
      <div className="w-10 h-10 rounded-xl bg-accent/20 grid place-items-center text-accent">
        <Bookmark size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">Quick capture</p>
        <p className="text-xs opacity-60">Drag the button to your bookmarks bar to save any page to Inbox.</p>
      </div>
      <a
        href={code}
        onClick={(e) => e.preventDefault()}
        className="px-3 py-2 rounded-xl bg-ink text-cream dark:bg-nightPrimary dark:text-nightBg text-sm font-medium hover:opacity-90"
        draggable
      >
        📦 Save to Stash
      </a>
    </motion.div>
  );
}
