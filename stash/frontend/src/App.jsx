import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Plus, Search, ArrowDownUp, Inbox } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";

import Sidebar from "./components/Sidebar.jsx";
import LinkCard from "./components/LinkCard.jsx";
import AddLinkModal from "./components/AddLinkModal.jsx";
import EditLinkModal from "./components/EditLinkModal.jsx";
import NewFolderModal from "./components/NewFolderModal.jsx";
import ConfirmDialog from "./components/ConfirmDialog.jsx";
import BookmarkletCard from "./components/BookmarkletCard.jsx";
import { useFolders } from "./hooks/useFolders.js";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts.js";

const SORTS = {
  newest: { label: "Newest", fn: (a, b) => new Date(b.created_at) - new Date(a.created_at) },
  oldest: { label: "Oldest", fn: (a, b) => new Date(a.created_at) - new Date(b.created_at) },
  az: { label: "A–Z", fn: (a, b) => a.name.localeCompare(b.name) },
  za: { label: "Z–A", fn: (a, b) => b.name.localeCompare(a.name) },
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const fh = useFolders();
  const [links, setLinks] = useState([]);
  const [linksLoading, setLinksLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState(null);
  const [sortKey, setSortKey] = useState("newest");

  const [showAdd, setShowAdd] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [confirm, setConfirm] = useState(null); // { type, payload }

  const [dark, setDark] = useState(() => localStorage.getItem("stash:dark") === "1");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("stash:dark", dark ? "1" : "0");
  }, [dark]);

  // Load links when folder changes
  useEffect(() => {
    if (!fh.selectedId) { setLinks([]); return; }
    setLinksLoading(true);
    fetch(`/api/folders/${fh.selectedId}/links`)
      .then((r) => r.json())
      .then(setLinks)
      .catch(() => toast.error("Could not load links"))
      .finally(() => setLinksLoading(false));
  }, [fh.selectedId]);

  const selectedFolder = fh.folders.find((f) => f.id === fh.selectedId) || null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return links
      .filter((l) => {
        if (tagFilter) {
          const t = (l.tags || "").split(",").map((s) => s.trim().toLowerCase());
          if (!t.includes(tagFilter.toLowerCase())) return false;
        }
        if (!q) return true;
        return (
          l.name.toLowerCase().includes(q) ||
          l.url.toLowerCase().includes(q) ||
          (l.tags || "").toLowerCase().includes(q)
        );
      })
      .sort(SORTS[sortKey].fn);
  }, [links, search, tagFilter, sortKey]);

  const fireConfetti = () => {
    const last = localStorage.getItem("stash:lastConfetti");
    if (last === todayKey()) return;
    localStorage.setItem("stash:lastConfetti", todayKey());
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#0B3B3A", "#E6A817", "#4DB6AC", "#FEF7E6"],
    });
  };

  const addLink = async ({ url, name, tags }) => {
    if (!fh.selectedId) return;
    const r = await fetch(`/api/folders/${fh.selectedId}/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, name, tags }),
    });
    if (!r.ok) return toast.error("Could not save link");
    const link = await r.json();
    setLinks((p) => [link, ...p]);
    toast.success("Link saved");
    fireConfetti();
  };

  const updateLink = async (patch) => {
    const r = await fetch(`/api/links/${editingLink.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!r.ok) return toast.error("Could not update");
    const link = await r.json();
    setLinks((p) => p.map((l) => (l.id === link.id ? link : l)));
    toast.success("Link updated");
  };

  const deleteLink = async (link) => {
    await fetch(`/api/links/${link.id}`, { method: "DELETE" });
    setLinks((p) => p.filter((l) => l.id !== link.id));
    toast.success("Link deleted");
  };

  const exportData = async () => {
    const r = await fetch("/api/export");
    const blob = await r.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "stash-export.json";
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Exported");
  };

  const importData = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/import", { method: "POST", body: fd });
    if (!r.ok) return toast.error("Import failed");
    toast.success("Imported");
    await fh.refresh();
  };

  // Keyboard shortcuts
  const shortcutHandlers = useMemo(
    () => ({
      newFolder: () => setShowNewFolder(true),
      newLink: () => fh.selectedId && setShowAdd(true),
      escape: () => {
        setShowAdd(false);
        setShowNewFolder(false);
        setEditingLink(null);
        setConfirm(null);
      },
    }),
    [fh.selectedId]
  );
  useKeyboardShortcuts(shortcutHandlers);

  const askDeleteFolder = (id) => {
    const f = fh.folders.find((x) => x.id === id);
    setConfirm({
      type: "folder",
      title: `Delete “${f?.name}”?`,
      message: "This will also delete every link inside this folder. This action cannot be undone.",
      run: () => fh.deleteFolder(id),
    });
  };

  return (
    <div className={`bg-blobs h-screen w-screen flex overflow-hidden ${dark ? "dark" : ""}`}>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: "12px",
            background: dark ? "#2E3135" : "#FFF9EF",
            color: dark ? "#e6e8eb" : "#0B3B3A",
            boxShadow: "0 10px 30px -12px rgba(0,0,0,.25)",
          },
        }}
      />

      <Sidebar
        folders={fh.folders}
        selectedId={fh.selectedId}
        onSelect={fh.setSelectedId}
        onCreate={fh.createFolder}
        onRename={fh.renameFolder}
        onDelete={askDeleteFolder}
        onAskNewFolder={() => setShowNewFolder(true)}
        dark={dark}
        onToggleDark={() => setDark((d) => !d)}
        onExport={exportData}
        onImport={importData}
      />

      <main className="flex-1 h-full overflow-y-auto scroll-thin">
        <div className="max-w-5xl mx-auto p-8">
          <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] opacity-50">Folder</p>
              <h2 className="font-display text-4xl">{selectedFolder?.name || "No folder"}</h2>
              <p className="text-sm opacity-60 mt-1">
                {filtered.length} {filtered.length === 1 ? "link" : "links"}
                {tagFilter && (
                  <>
                    {" · filtering "}
                    <button
                      className="text-accent underline underline-offset-2"
                      onClick={() => setTagFilter(null)}
                    >
                      #{tagFilter} ✕
                    </button>
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="pl-8 pr-3 py-2 rounded-full text-sm bg-white/70 dark:bg-white/10 outline-none border border-transparent focus:border-ink/30 dark:focus:border-white/20 w-48"
                />
              </div>
              <div className="relative">
                <ArrowDownUp size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className="appearance-none pl-8 pr-7 py-2 rounded-full text-sm bg-white/70 dark:bg-white/10 outline-none border border-transparent focus:border-ink/30 dark:focus:border-white/20"
                >
                  {Object.entries(SORTS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <button
                disabled={!fh.selectedId}
                onClick={() => setShowAdd(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-ink font-semibold shadow-soft disabled:opacity-40 hover:scale-[1.03] active:scale-95 transition"
              >
                <Plus size={16} /> Add link
                <kbd className="ml-1 text-[10px] opacity-70 border border-ink/20 rounded px-1">⌘L</kbd>
              </button>
            </div>
          </header>

          {fh.folders.length === 0 ? (
            <EmptyState
              icon="📦"
              title="Welcome to Stash"
              text="Your personal toolbox for URLs. Create your first folder to get started."
              cta={
                <button
                  onClick={() => setShowNewFolder(true)}
                  className="px-5 py-2.5 rounded-full bg-ink text-cream dark:bg-nightPrimary dark:text-nightBg font-semibold"
                >
                  Create folder
                </button>
              }
            />
          ) : !fh.selectedId ? (
            <EmptyState icon="📁" title="Select a folder" text="Pick a folder from the sidebar to see its links." />
          ) : (
            <>
              <BookmarkletCard />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                <AnimatePresence>
                  {filtered.map((l) => (
                    <LinkCard
                      key={l.id}
                      link={l}
                      onEdit={setEditingLink}
                      onDelete={(link) =>
                        setConfirm({
                          type: "link",
                          title: `Delete “${link.name}”?`,
                          message: "This link will be removed from your toolbox.",
                          run: () => deleteLink(link),
                        })
                      }
                      onTagClick={(t) => setTagFilter(t)}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {!linksLoading && filtered.length === 0 && (
                <EmptyState
                  icon={<Inbox size={36} />}
                  title={search || tagFilter ? "No matches" : "Empty folder"}
                  text={
                    search || tagFilter
                      ? "Try a different search or clear the tag filter."
                      : "Add your first link with the button above (⌘L)."
                  }
                />
              )}
            </>
          )}
        </div>
      </main>

      <NewFolderModal open={showNewFolder} onClose={() => setShowNewFolder(false)} onSubmit={fh.createFolder} />
      <AddLinkModal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={addLink} />
      <EditLinkModal open={!!editingLink} link={editingLink} onClose={() => setEditingLink(null)} onSubmit={updateLink} />
      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          await confirm.run();
          setConfirm(null);
        }}
      />
    </div>
  );
}

function EmptyState({ icon, title, text, cta }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-12 text-center mt-8 border border-black/5 dark:border-white/5"
    >
      <div className="text-5xl mb-3">{typeof icon === "string" ? icon : icon}</div>
      <h3 className="font-display text-2xl">{title}</h3>
      <p className="opacity-70 text-sm mt-1 max-w-sm mx-auto">{text}</p>
      {cta && <div className="mt-5">{cta}</div>}
    </motion.div>
  );
}
