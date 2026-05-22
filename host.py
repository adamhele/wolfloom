import sys
import psutil
import os
import random
import datetime
import logging
import socket
from flask import Flask, render_template, send_from_directory, request, redirect, url_for, jsonify
from werkzeug.utils import secure_filename


def resource_path(relative_path):
    if getattr(sys, "frozen", False):
        base_path = sys._MEIPASS
    else:
        base_path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_path, relative_path)


app = Flask(
    __name__,
    template_folder=resource_path("templates"),
    static_folder=resource_path("static"),
)

files_dir = resource_path(os.path.join("Files", "Data"))
quotes_file = resource_path("quotes.txt")
notes_file = resource_path(os.path.join("static", "notes.txt"))

@app.route("/")
def home():
    quote = ""
    if os.path.exists(quotes_file):
        with open(quotes_file, "r", encoding="utf-8") as f:
            lines = [line.strip() for line in f.readlines() if line.strip()]
            if lines:
                quote = random.choice(lines)
    return render_template("index.html", quote=quote)

@app.route("/notes")
def notes_page():
    return render_template("notes_index.html")

@app.route("/notes_backend", methods=["GET"])
def get_notes():
    if os.path.exists(notes_file):
        with open(notes_file, "r", encoding="utf-8") as f:
            content = f.read()
        last_modified = os.path.getmtime(notes_file)
    else:
        content = ""
        last_modified = 0
    return jsonify({"content": content, "last_modified": last_modified})

@app.route("/notes_backend", methods=["POST"])
def save_notes():
    data = request.get_json(silent=True) or {}
    content = data.get("content", "")
    os.makedirs(os.path.dirname(notes_file), exist_ok=True)
    with open(notes_file, "w", encoding="utf-8") as f:
        f.write(content)
    return jsonify({"status": "ok"})

@app.route("/debug")
def debug_page():
    return render_template("debug_task.html", body_class="debug-page")

@app.route("/debug/stats")
def debug_stats():
    stats = {
        "cpu_percent": psutil.cpu_percent(interval=0.1),
        "memory_percent": psutil.virtual_memory().percent,
        "swap_percent": psutil.swap_memory().percent,
        "disk_percent": psutil.disk_usage("/").percent,
    }
    return jsonify(stats)

@app.route("/files")
def files_page():
    os.makedirs(files_dir, exist_ok=True)
    files = sorted(os.listdir(files_dir))
    file_sizes = {f: os.path.getsize(os.path.join(files_dir, f)) for f in files}
    file_dates = {f: os.path.getmtime(os.path.join(files_dir, f)) for f in files}

    def fmt_size(size):
        for unit in ["B", "KB", "MB", "GB"]:
            if size < 1024:
                return f"{int(size)} {unit}"
            size /= 1024
        return f"{int(size)} TB"

    sizes = {f: fmt_size(file_sizes[f]) for f in files}
    dates = {
        f: datetime.datetime.fromtimestamp(file_dates[f]).strftime("%d.%m.%y %H:%M")
        for f in files
    }
    return render_template("files_index.html", files=files, file_sizes=sizes, file_dates=dates)

@app.route("/files/data/<path:filename>")
def serve_file(filename):
    return send_from_directory(files_dir, filename, as_attachment=True)

@app.route("/files/upload", methods=["POST"])
def upload_file():
    uploaded = request.files.get("file")
    if not uploaded or uploaded.filename == "":
        return redirect(url_for("files_page"))

    os.makedirs(files_dir, exist_ok=True)
    safe_name = secure_filename(uploaded.filename)
    if not safe_name:
        return redirect(url_for("files_page"))

    target_path = os.path.join(files_dir, safe_name)
    base, ext = os.path.splitext(safe_name)
    counter = 1

    while os.path.exists(target_path):
        target_path = os.path.join(files_dir, f"{base}_{counter}{ext}")
        counter += 1

    uploaded.save(target_path)
    return redirect(url_for("files_page"))

@app.route("/files/delete/<path:filename>", methods=["POST"])
def delete_file(filename):
    safe_name = os.path.basename(filename)
    path = os.path.abspath(os.path.join(files_dir, safe_name))
    files_root = os.path.abspath(files_dir)

    if not path.startswith(files_root + os.sep) and path != files_root:
        return "Invalid path", 400

    if os.path.exists(path) and os.path.isfile(path):
        os.remove(path)
        return "", 200

    return "File not found", 404

def get_lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    finally:
        s.close()

if __name__ == "__main__":
    port = 5000
    host = "0.0.0.0"
    lan_ip = get_lan_ip()
    logging.getLogger("werkzeug").setLevel(logging.ERROR)
    
    print("Wolfloom starting...")
    print(f"This device:            http://localhost:{port}/")
    print(f"Others on the network:  http://{lan_ip}:{port}/")
    
    app.run(host=host, port=port, debug=False, threaded=True, use_reloader=False)
