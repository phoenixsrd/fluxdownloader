async function getFormats() {
  const url = document.getElementById('url').value;
  const resultsDiv = document.getElementById('results');
  const infoDiv = document.getElementById('videoInfo');
  resultsDiv.innerHTML = 'Carregando...';
  infoDiv.innerHTML = '';

  const res = await fetch('/formats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });

  const data = await res.json();
  resultsDiv.innerHTML = '';

  if (data.error) {
    resultsDiv.innerHTML = `<p>Erro: ${data.error}</p>`;
    return;
  }

  if (data.videoInfo) {
    const { title, duration, thumbnail } = data.videoInfo;
    infoDiv.innerHTML = `
      <img src="${thumbnail}" alt="Thumbnail">
      <h2>${title}</h2>
      <p>Duração: ${duration}</p>
    `;
  }

  if (!data.formats || data.formats.length === 0) {
    resultsDiv.innerHTML = '<p>Nenhuma Qualidade Encontrada.</p>';
    return;
  }

  data.formats.forEach(format => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <span>${format.format_note || format.format_id} - ${format.ext.toUpperCase()} (${format.resolution || 'Áudio'})</span>
      <a href="${format.url}" target="_blank">Baixar</a>
    `;
    resultsDiv.appendChild(div);
  });

  const mp3 = document.createElement('div');
  mp3.className = 'item';
  mp3.innerHTML = `
    <span>Baixar Como MP3</span>
    <a href="/download-mp3?url=${encodeURIComponent(url)}" target="_blank">MP3</a>
  `;
  resultsDiv.appendChild(mp3);
}