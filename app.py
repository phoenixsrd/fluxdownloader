import os
import json
import yt_dlp
from flask import Flask, request, jsonify, send_file, send_from_directory

app = Flask(__name__)

@app.route("/")
def home():
    return send_from_directory(".", "index.html")

@app.route("/get-formats", methods=["POST"])
def get_formats():
    data = request.json
    url = data.get("url")
    mode = data.get("mode")

    if not url or not mode:
        return jsonify({"error": "URL Ou Modo Não Fornecido."}), 400

    ydl_opts = {
        'quiet': True,
        'skip_download': True,
    }

    formats = []
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        for f in info.get("formats", []):
            if f.get("filesize") and f.get("acodec") != "none":
                if mode == "video" and f.get("vcodec") != "none":
                    formats.append({
                        "format_id": f["format_id"],
                        "ext": f["ext"],
                        "resolution": f.get("format_note") or f.get("height", ""),
                        "filesize": f["filesize"]
                    })
                elif mode == "audio" and f.get("vcodec") == "none":
                    formats.append({
                        "format_id": f["format_id"],
                        "ext": f["ext"],
                        "resolution": "audio",
                        "filesize": f["filesize"]
                    })

    formats.sort(key=lambda x: x["filesize"], reverse=True)
    return jsonify(formats)

@app.route("/download", methods=["POST"])
def download():
    data = request.json
    url = data.get("url")
    format_id = data.get("format_id")
    mode = data.get("mode")

    if not url or not format_id or not mode:
        return jsonify({"error": "Dados Incompletos"}), 400

    filename = "output.mp3" if mode == "audio" else "output.mp4"

    ydl_opts = {