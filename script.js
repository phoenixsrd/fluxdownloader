document.getElementById('fetch').onclick = async () => {
  const url = document.getElementById('url').value;
  const type = document.getElementById('type').value;
  const quality = document.getElementById('quality');
  const preview = document.getElementById('preview');
  quality.innerHTML = '';
  preview.innerHTML = '';
  quality.style.display = 'none';

  const res = await fetch('/formats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, type })
  });

  const data = await res.json();
  if (data.error) return alert(data.error);

  const info = data.results[0];
  preview.innerHTML = `
    <h3>${info.title}</h3>
    <img src="${info.thumbnail}" />
    <p>Duração: ${info.duration}</p>
  `;

  info.formats.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.url;
    opt.textContent = type === 'audio'
      ? `${f.ext} - ${f.abr || '??'}kbps`
      : `${f.ext} - ${f.resolution || '??'}p`;
    quality.appendChild(opt);
  });

  quality.style.display = 'inline-block';
  document.getElementById('download').style.display = 'inline-block';
};

document.getElementById('download').onclick = () => {
  const url = document.getElementById('quality').value;
  window.open(url, '_blank');
};