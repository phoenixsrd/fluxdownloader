const urlInput = document.getElementById('url');
const typeInput = document.getElementById('type');

async function fetchFormats() {
  const url = urlInput.value.trim();
  const type = typeInput.value;
  const quality = document.getElementById('quality');
  const preview = document.getElementById('preview');
  quality.innerHTML = '';
  preview.innerHTML = '';
  quality.style.display = 'none';

  if (!url) return;

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
}

let timeout;
urlInput.addEventListener('input', () => {
  clearTimeout(timeout);
  timeout = setTimeout(fetchFormats, 800);
});

typeInput.addEventListener('change', fetchFormats);

document.getElementById('download').onclick = () => {
  const url = document.getElementById('quality').value;
  window.open(url, '_blank');
};