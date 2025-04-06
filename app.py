from flask import Flask, request, send_file, jsonify, render_template
from flask_cors import CORS
import yt_dlp
import os
import uuid

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        url = request.form['url']
        tipo = request.form['tipo']
        format_id = request.form['format_id']
        filename = f"downloads/{uuid.uuid4()}.%(ext)s"
        ydl_opts = {
            'outtmpl': filename,
            'format': format_id,
            'quiet': True,
        }

        if tipo == "audio":
            ydl_opts['postprocessors'] = [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
            }]

        os.makedirs("downloads", exist_ok=True)
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            final_path = ydl.prepare_filename(info)
            if tipo == "audio":
                final_path = final_path.rsplit('.', 1)[0] + ".mp3"
        return send_file(final_path, as_attachment=True)

    return render_template('index.html')

@app.route('/formats')
def formats():
    url = request.args.get('url')
    ydl_opts = {'quiet': True}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        formats = info.get('formats', [])
        audio = []
        video = []
        for f in formats:
            if f.get('acodec') != 'none' and f.get('vcodec') == 'none':
                audio.append({'format_id': f['format_id'], 'abr': f.get('abr', '0'), 'ext': f['ext']})
            elif f.get('acodec') != 'none' and f.get('vcodec') != 'none':
                video.append({'format_id': f['format_id'], 'resolution': f.get('height', 0), 'ext': f['ext']})
        audio = sorted(audio, key=lambda x: int(float(x['abr'])), reverse=True)
        video = sorted(video, key=lambda x: int(x['resolution']), reverse=True)
        for v in video:
            v['resolution'] = f"{v['resolution']}p"
        return jsonify({'audio': audio, 'video': video})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))