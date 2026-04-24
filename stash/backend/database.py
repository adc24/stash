import os
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get("DATABASE_URL")


def get_conn():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)


def init_db():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS folders (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS links (
        id SERIAL PRIMARY KEY,
        folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        tags TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    cur.close()
    conn.close()


# ---------- Folder CRUD ----------

def list_folders():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("SELECT * FROM folders ORDER BY created_at ASC")
    rows = cur.fetchall()

    cur.close()
    conn.close()
    return rows


def create_folder(name):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO folders (name) VALUES (%s) RETURNING *",
        (name,)
    )
    row = cur.fetchone()

    conn.commit()
    cur.close()
    conn.close()
    return row


def delete_folder(folder_id):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("DELETE FROM folders WHERE id = %s", (folder_id,))

    conn.commit()
    cur.close()
    conn.close()


# ---------- Link CRUD ----------

def list_links(folder_id):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        "SELECT * FROM links WHERE folder_id = %s ORDER BY created_at DESC",
        (folder_id,)
    )
    rows = cur.fetchall()

    cur.close()
    conn.close()
    return rows


def create_link(folder_id, name, url, tags=None):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO links (folder_id, name, url, tags) VALUES (%s, %s, %s, %s) RETURNING *",
        (folder_id, name, url, tags or "")
    )
    row = cur.fetchone()

    conn.commit()
    cur.close()
    conn.close()
    return row


def delete_link(link_id):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("DELETE FROM links WHERE id = %s", (link_id,))

    conn.commit()
    cur.close()
    conn.close()