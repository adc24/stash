"""SQLite helpers for Stash."""
import os
import sqlite3
from contextlib import contextmanager

DB_PATH = os.environ.get("STASH_DB_PATH", "stash.db")

SCHEMA = """
CREATE TABLE IF NOT EXISTS folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    folder_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
);
"""


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    with get_conn() as conn:
        conn.executescript(SCHEMA)


def row_to_dict(row):
    return {k: row[k] for k in row.keys()} if row else None


# ---------- Folder CRUD ----------

def list_folders():
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM folders ORDER BY created_at ASC").fetchall()
        return [row_to_dict(r) for r in rows]


def create_folder(name):
    with get_conn() as conn:
        cur = conn.execute("INSERT INTO folders (name) VALUES (?)", (name,))
        row = conn.execute("SELECT * FROM folders WHERE id = ?", (cur.lastrowid,)).fetchone()
        return row_to_dict(row)


def rename_folder(folder_id, name):
    with get_conn() as conn:
        conn.execute("UPDATE folders SET name = ? WHERE id = ?", (name, folder_id))
        row = conn.execute("SELECT * FROM folders WHERE id = ?", (folder_id,)).fetchone()
        return row_to_dict(row)


def delete_folder(folder_id):
    with get_conn() as conn:
        conn.execute("DELETE FROM folders WHERE id = ?", (folder_id,))


def get_or_create_folder(name):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM folders WHERE name = ?", (name,)).fetchone()
        if row:
            return row_to_dict(row)
    return create_folder(name)


# ---------- Link CRUD ----------

def list_links(folder_id):
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM links WHERE folder_id = ? ORDER BY created_at DESC",
            (folder_id,),
        ).fetchall()
        return [row_to_dict(r) for r in rows]


def create_link(folder_id, name, url, tags=None):
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO links (folder_id, name, url, tags) VALUES (?, ?, ?, ?)",
            (folder_id, name, url, tags or ""),
        )
        row = conn.execute("SELECT * FROM links WHERE id = ?", (cur.lastrowid,)).fetchone()
        return row_to_dict(row)


def update_link(link_id, name=None, url=None, tags=None):
    with get_conn() as conn:
        current = conn.execute("SELECT * FROM links WHERE id = ?", (link_id,)).fetchone()
        if not current:
            return None
        new_name = name if name is not None else current["name"]
        new_url = url if url is not None else current["url"]
        new_tags = tags if tags is not None else current["tags"]
        conn.execute(
            "UPDATE links SET name = ?, url = ?, tags = ? WHERE id = ?",
            (new_name, new_url, new_tags, link_id),
        )
        row = conn.execute("SELECT * FROM links WHERE id = ?", (link_id,)).fetchone()
        return row_to_dict(row)


def delete_link(link_id):
    with get_conn() as conn:
        conn.execute("DELETE FROM links WHERE id = ?", (link_id,))


# ---------- Export / Import ----------

def export_all():
    with get_conn() as conn:
        folders = [row_to_dict(r) for r in conn.execute("SELECT * FROM folders").fetchall()]
        links = [row_to_dict(r) for r in conn.execute("SELECT * FROM links").fetchall()]
    return {"folders": folders, "links": links}


def import_all(data):
    folders = data.get("folders", [])
    links = data.get("links", [])
    with get_conn() as conn:
        conn.execute("DELETE FROM links")
        conn.execute("DELETE FROM folders")
        # Preserve original IDs so link.folder_id stays valid
        for f in folders:
            conn.execute(
                "INSERT INTO folders (id, name, created_at) VALUES (?, ?, ?)",
                (f.get("id"), f.get("name"), f.get("created_at")),
            )
        for l in links:
            conn.execute(
                "INSERT INTO links (id, folder_id, name, url, tags, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (
                    l.get("id"),
                    l.get("folder_id"),
                    l.get("name"),
                    l.get("url"),
                    l.get("tags", ""),
                    l.get("created_at"),
                ),
            )
