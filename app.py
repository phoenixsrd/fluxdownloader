from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import yt_dlp
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

@app.route('for f in entry.get('formats', []):
    if f.get('url') and f.get('ext') and f.get('acodec') != 'none':
        formats.append({
            'format_id': f.get('format_id'),
            'ext': f.get('ext'),
            'resolution': f.get('resolution') or f.get('height'),
            'abr': f.get('abr', ''),
            'url': f.get('url'),
        })', methods=['POST'])
def get_formats():
    data = request.get_json()
    url = data.get('url')
    type_ = data.get('type')

    if not url:
        return jsonify({'error': 'URL ausente'})

    ydl_opts = {
        'quiet': True,
        'extract_flat': False
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            entry = info['entries'][0] if 'entries' in info else info
            formats = []

            for f in entry.get('formats', []):
                if f.get('url') and f.get('ext'):
                    if type_ == 'audio' and f.get('vcodec') == 'none':
                        formats.append({
                            'format_id': f.get('format_id'),
                            'ext': f.get('ext'),
                            'abr': f.get('abr', ''),
                            'url': f.get('url'),
                        })
                    elif type_ == 'video' and f.get('vcodec') != 'none' and f.get('acodec') != 'none':
                        formats.append({
                            'format_id': f.get('format_id'),
                            'ext': f.get('ext'),
                            'resolution': f.get('resolution') or f.get('height'),
                            'fps': f.get('fps', ''),
                            'url': f.get('url'),
                        })

            formats.sort(key=lambda x: int(x.get('abr', 0) if type_ == 'audio' else x.get('resolution', 0)), reverse=True)

            return jsonify({
                'results': [{
                    'title': entry.get('title'),
                    'thumbnail': entry.get('thumbnail'),
                    'duration': f"{int(entry.get('duration', 0) // 60)}min",
                    'formats': formats
                }]
            })
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)