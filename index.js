const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.post('/formats', (req, res) => {
  const videoUrl = req.body.url;
  if (!videoUrl) return res.status(400).json({ error: 'URL Ausente' });

  const command = `yt-dlp -j --no-playlist "${videoUrl}"`;

  exec(command, { maxBuffer: 1024 * 10000 }, (err, stdout) => {
    if (err) {
      return res.status(500).json({ error: 'Erro Ao Executar yt-dlp' });
    }

    try {
      const data = JSON.parse(stdout);
      const formats = data.formats.filter(f => f.url && f.ext && (f.format_note || f.format_id));
      res.json(formats);
    } catch (e) {
      res.status(500).json({ error: 'Erro Ao Interpretar Resposta' });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor Rodando Na Porta${PORT}`));
