from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS
import yt_dlp
import requests
import os

os.environ['PATH'] += os.pathsep + '/usr/bin'

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/script.js')
def js():
    return send_from_directory('.', 'script.js')

def parse_resolution(res):
    try:
        return int(str(res).replace('p', '').strip())
    except:
        return 0

@app.route('/formats', methods=['POST'])
def get_formats():
    data = request.get_json()
    url = data.get('url')

    if not url:
        return jsonify({'error': 'URL ausente'})

    ydl_opts = {
        'quiet': True,
        'extract_flat': False
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            entries = info['entries'] if 'entries' in info else [info]
            results = []

            for entry in entries:
                formats = []
                for f in entry.get('formats', []):
                    if f.get('url') and f.get('ext') and f.get('acodec') != 'none':
                        resolution = f.get('resolution') or f.get('height') or f.get('format_note') or 'audio only'
                        formats.append({
                            'format_id': f.get('format_id'),
                            'ext': f.get('ext'),
                            'resolution': resolution,
                            'abr': f.get('abr', ''),
                            'fps': f.get('fps', ''),
                            'url': f.get('url'),
                        })

                # Ordenar da qualidade mais alta para a mais baixa
                formats.sort(key=lambda x: parse_resolution(x.get('resolution')), reverse=True)

                results.append({
                    'title': entry.get('title'),
                    'thumbnail': entry.get('thumbnail'),
                    'duration': f"{int(entry.get('duration', 0) // 60)}min",
                    'formats': formats
                })
            return jsonify({'results': results})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/download')
def proxy_download():
    url = request.args.get('url')
    title = request.args.get('title', 'download')
    ext = request.args.get('ext', 'mp4')

    if not url:
        return 'URL Inválida', 400
    try:
        r = requests.get(url, stream=True)
        filename = f"{title}.{ext}".replace(' ', '_').replace('/', '_').replace('?', '')
        return Response(
            r.iter_content(chunk_size=8192),
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Type": "application/octet-stream"
            }
        )
    except Exception as e:
        return f'Erro no download: {str(e)}', 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)