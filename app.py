import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import yt_dlp
import uuid

app = Flask(__name__)
CORS(app)

DOWNLOAD_DIR = "downloads"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

@app.route('/get_info', methods=['POST'])
def get_info():
    data = request.get_json()
    url = data.get('url')

    ydl_opts = {'quiet': True}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)

        formats = [
            {
                "format_id": f["format_id"],
                "ext": f["ext"],
                "resolution": f.get("resolution") or f.get("height", "audio"),
                "filesize": f.get("filesize") or f.get("filesize_approx"),
                "acodec": f.get("acodec"),
                "vcodec": f.get("vcodec"),
                "has_audio": f.get("acodec") != "none",
                "has_video": f.get("vcodec") != "none"
            }
            for f in info.get("formats", [])
            if f.get("acodec") != "none"
        ]

        return jsonify({
            "title": info.get("title"),
            "thumbnail": info.get("thumbnail"),
            "formats": formats
        })

@app.route('/download', methods=['POST'])
def download():
    data = request.get_json()
    url = data.get('url')
    format_id = data.get('format_id')

    filename = f"{uuid.uuid4()}.%(ext)s"
    output_path = os.path.join(DOWNLOAD_DIR, filename)

    ydl_opts = {
        'format': format_id,
        'outtmpl': output_path,
        'quiet': True,
        'merge_output_format': 'mp4',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3' if 'audio' in format_id else 'mp4',
            'preferredquality': '192',
        }],
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        final_file = ydl.prepare_filename(info).replace("%(ext)s", info.get("ext"))

    return send_file(final_file, as_attachment=True)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)