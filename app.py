from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import yt_dlp
import uuid
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/script.js')
def js():
    return send_from_directory('.', 'script.js')

@app.route('/formats', methods=['POST'])
def get_formats():
    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({'error': 'URL Ausente'})

    ydl_opts = {
        'quiet': True,
        'extract_flat': False
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)

            if 'entries' in info:
                info = info['entries'][0]

            formats = []
            for f in info.get('formats', []):
                if f.get('url') and f.get('ext'):
                    formats.append({
                        'format_id': f.get('format_id'),
                        'format_note': f.get('format_note'),
                        'ext': f.get('ext'),
                        'url': f.get('url'),
                        'resolution': f.get('resolution')
                    })

            videoInfo = {
                'title': info.get('title'),
                'thumbnail': info.get('thumbnail'),
                'duration': f"{int(info.get('duration', 0) // 60)}min"
            }

            return jsonify({'formats': formats, 'videoInfo': videoInfo})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/download-mp3')
def download_mp3():
    url = request.args.get('url')
    if not url:
        return 'URL Ausente', 400

    try:
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': '/tmp/%(title)s.%(ext)s',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'quiet': True,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            mp3_file = ydl.prepare_filename(info).rsplit('.', 1)[0] + '.mp3'
            return send_file(mp3_file, as_attachment=True)

    except Exception as e:
        return f'Erro: {str(e)}', 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)