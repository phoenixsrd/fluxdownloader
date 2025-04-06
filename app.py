from flask import Flask, request, send_file, jsonify
import yt_dlp
import os
import uuid
import zipfile
from pathlib import Path

app = Flask(__name__)

@app.route("/get_info", methods=["POST"])
def get_info():
    url = request.json["url"]
    ydl_opts = {
        'quiet': True,
        'skip_download': True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)

    formats = []
    for f in info['formats']:
        if f.get("acodec") != "none":
            formats.append({
                "format_id": f["format_id"],
                "ext": f["ext"],
                "resolution": f.get("resolution") or f.get("height"),
                "filesize": f.get("filesize"),
                "has_video": f.get("vcodec") != "none",
                "has_audio": f.get("acodec") != "none",
            })

    return jsonify({
        "title": info.get("title"),
        "thumbnail": info.get("thumbnail"),
        "formats": formats
    })

@app.route("/download", methods=["POST"])
def download():
    data = request.json
    url = data["url"]
    format_id = data["format_id"]
    convert_mp3 = data.get("convert_mp3", False)

    file_id = str(uuid.uuid4())
    outtmpl = f"/tmp/{file_id}.%(ext)s"

    ydl_opts = {
        "format": format_id,
        "outtmpl": outtmpl,
        "quiet": True,
        "ffmpeg_location": "/usr/bin"
    }

    if convert_mp3:
        ydl_opts["postprocessors"] = [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }]

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        final_path = ydl.prepare_filename(info)
        if convert_mp3:
            final_path = Path(final_path).with_suffix(".mp3")

    return send_file(str(final_path), as_attachment=True)

@app.route("/download_playlist", methods=["POST"])
def download_playlist():
    data = request.json
    url = data["url"]
    convert_mp3 = data.get("convert_mp3", False)

    temp_dir = f"/tmp/{uuid.uuid4()}"
    os.makedirs(temp_dir, exist_ok=True)

    ydl_opts = {
        "outtmpl": os.path.join(temp_dir, "%(title)s.%(ext)s"),
        "quiet": True,
        "ffmpeg_location": "/usr/bin",
        "ignoreerrors": True
    }

    if convert_mp3:
        ydl_opts["postprocessors"] = [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }]

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    zip_path = f"{temp_dir}.zip"
    with zipfile.ZipFile(zip_path, "w") as zipf:
        for root, _, files in os.walk(temp_dir):
            for file in files:
                zipf.write(os.path.join(root, file), file)

    return send_file(zip_path, as_attachment=True)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)