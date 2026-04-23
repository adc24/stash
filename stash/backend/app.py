"""Stash – Flask backend.

Serves the JSON API and (in production) the built React frontend.
"""
import json
import os
from urllib.parse import urlparse

from flask import Flask, jsonify, request, send_from_directory, Response
from flask_cors import CORS

from backend import database as db

# Resolve frontend build directory (frontend/dist) relative to this file.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIST = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend", "dist"))

app = Flask(__name__, static_folder=None)
CORS(app)  # allow Vite dev server (5173) during development

db.init_db()


# ---------- helpers ----------

DOMAIN_OVERRIDES = {
    "drive.google.com": "Google Drive",
    "docs.google.com": "Google Docs",
    "sheets.google.com": "Google Sheets",
    "slides.google.com": "Google Slides",
    "mail.google.com": "Gmail",
    "github.com": "GitHub",
    "gist.github.com": "GitHub Gist",
    "notion.so": "Notion",
    "www.notion.so": "Notion",
    "figma.com": "Figma",
    "youtube.com": "YouTube",
    "youtu.be": "YouTube",
    "twitter.com": "Twitter",
    "x.com": "X",
    "stackoverflow.com": "Stack Overflow",
}


def auto_name_from_url(url: str) -> str:
    """Generate a friendly link name from a URL."""
    try:
        parsed = urlparse(url if "://" in url else f"https://{url}")
        host = (parsed.hostname or "").lower()
        if not host:
            return "New Link"
        if host in DOMAIN_OVERRIDES:
            return DOMAIN_OVERRIDES[host]
        host_no_www = host[4:] if host.startswith("www.") else host
        if host_no_www in DOMAIN_OVERRIDES:
            return DOMAIN_OVERRIDES[host_no_www]
        first = host_no_www.split(".")[0]
        return first.capitalize() if first else "New Link"
    except Exception:
        return "New Link"


def normalize_url(url: str) -> str:
    if not url:
        return url
    if "://" not in url:
        return f"https://{url}"
    return url


# ---------- folders ----------

@app.get("/api/folders")
def get_folders():
    return jsonify(db.list_folders())


@app.post("/api/folders")
def post_folder():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "name is required"}), 400
    return jsonify(db.create_folder(name)), 201


@app.put("/api/folders/<int:folder_id>")
def put_folder(folder_id):
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "name is required"}), 400
    folder = db.rename_folder(folder_id, name)
    if not folder:
        return jsonify({"error": "not found"}), 404
    return jsonify(folder)


@app.delete("/api/folders/<int:folder_id>")
def del_folder(folder_id):
    db.delete_folder(folder_id)
    return jsonify({"ok": True})


# ---------- links ----------

@app.get("/api/folders/<int:folder_id>/links")
def get_links(folder_id):
    return jsonify(db.list_links(folder_id))


@app.post("/api/folders/<int:folder_id>/links")
def post_link(folder_id):
    data = request.get_json(silent=True) or {}
    url = normalize_url((data.get("url") or "").strip())
    if not url:
        return jsonify({"error": "url is required"}), 400
    name = (data.get("name") or "").strip() or auto_name_from_url(url)
    tags = (data.get("tags") or "").strip()
    return jsonify(db.create_link(folder_id, name, url, tags)), 201


@app.put("/api/links/<int:link_id>")
def put_link(link_id):
    data = request.get_json(silent=True) or {}
    name = data.get("name")
    url = normalize_url(data.get("url")) if data.get("url") else None
    tags = data.get("tags")
    link = db.update_link(link_id, name=name, url=url, tags=tags)
    if not link:
        return jsonify({"error": "not found"}), 404
    return jsonify(link)


@app.delete("/api/links/<int:link_id>")
def del_link(link_id):
    db.delete_link(link_id)
    return jsonify({"ok": True})


# ---------- export / import ----------

@app.get("/api/export")
def export_data():
    payload = json.dumps(db.export_all(), indent=2)
    return Response(
        payload,
        mimetype="application/json",
        headers={"Content-Disposition": "attachment; filename=stash-export.json"},
    )


@app.post("/api/import")
def import_data():
    # Accept either uploaded file ("file" field) or raw JSON body.
    if "file" in request.files:
        try:
            data = json.loads(request.files["file"].read().decode("utf-8"))
        except Exception as e:
            return jsonify({"error": f"invalid JSON: {e}"}), 400
    else:
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({"error": "no JSON payload"}), 400
    try:
        db.import_all(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    return jsonify({"ok": True})


# ---------- bookmarklet ----------

@app.get("/api/bookmarklet")
def bookmarklet():
    url = normalize_url((request.args.get("url") or "").strip())
    title = (request.args.get("title") or "").strip()
    if not url:
        return "Missing url", 400
    inbox = db.get_or_create_folder("Inbox")
    name = title or auto_name_from_url(url)
    db.create_link(inbox["id"], name, url, "")
    # Friendly little auto-close page
    return Response(
        """<!doctype html><meta charset="utf-8"><title>Saved to Stash</title>
<body style="font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0;background:#FEF7E6;color:#0B3B3A">
<div style="text-align:center"><h1>Saved to Stash 📦</h1><p>You can close this tab.</p></div>
<script>setTimeout(()=>window.close(),800)</script></body>""",
        mimetype="text/html",
    )


# ---------- frontend (production) ----------

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if not os.path.isdir(FRONTEND_DIST):
        return jsonify({"error": "frontend not built. Run `npm run build` in frontend/."}), 404
    target = os.path.join(FRONTEND_DIST, path)
    if path and os.path.isfile(target):
        return send_from_directory(FRONTEND_DIST, path)
    return send_from_directory(FRONTEND_DIST, "index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
