import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const api = (path, opts) => fetch(path, opts).then(async (r) => {
  if (!r.ok) {
    const msg = await r.text().catch(() => r.statusText);
    throw new Error(msg || "Request failed");
  }
  return r.json();
});

export function useFolders() {
  const [folders, setFolders] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api("/api/folders");
      setFolders(data);
      setSelectedId((cur) => (cur && data.some((f) => f.id === cur) ? cur : data[0]?.id ?? null));
    } catch (e) {
      toast.error("Could not load folders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const createFolder = async (name) => {
    const f = await api("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setFolders((p) => [...p, f]);
    setSelectedId(f.id);
    toast.success(`Folder “${f.name}” created`);
    return f;
  };

  const renameFolder = async (id, name) => {
    const f = await api(`/api/folders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setFolders((p) => p.map((x) => (x.id === id ? f : x)));
    toast.success("Folder renamed");
  };

  const deleteFolder = async (id) => {
    await api(`/api/folders/${id}`, { method: "DELETE" });
    setFolders((p) => {
      const next = p.filter((x) => x.id !== id);
      if (selectedId === id) setSelectedId(next[0]?.id ?? null);
      return next;
    });
    toast.success("Folder deleted");
  };

  return { folders, selectedId, setSelectedId, loading, refresh, createFolder, renameFolder, deleteFolder };
}
