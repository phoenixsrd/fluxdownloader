const urlInput = document.getElementById('url');
const quality = document.getElementById('quality');
const preview = document.getElementById('preview');
const downloadBtn = document.getElementById('download');

urlInput.addEventListener('input', async () => {
  const url = urlInput.value.trim();
  if (!url.includes('http')) return;

  quality.innerHTML = '';
  preview.innerHTML = '';
  quality.style.display = 'none';
  downloadBtn.style.display = 'none';

  const res = await fetch('/formats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, type: 'video' })
  });

  const data = await res.json();
  if (data.error) return alert(data.error);

  const info = data.results[0];
  preview.innerHTML = `
    <h3>${info.title}</h3>
    <img src="${info.thumbnail}" />
    <p>Duração: ${info.duration}</p>
  `;

  const sorted = info.formats
    .filter(f => f.url)
    .sort((a, b) => {
      const resA = parseInt((a.resolution || '').replace('p', '')) || 0;
      const resB = parseInt((b.resolution || '').replace('p', '')) || 0;
      return resB - resA;
    });

  sorted.forEach(f => {
    const opt = document.createElement('option');
    opt.value = JSON.stringify(f);
    opt.textContent = `${f.ext} - ${f.resolution || '??'}p`;
    quality.appendChild(opt);
  });

  quality.style.display = 'inline-block';
  downloadBtn.style.display = 'inline-block';
  preview.dataset.title = info.title;
});

downloadBtn.onclick = () => {
  const selected = JSON.parse(quality.value);
  const title = preview.dataset.title || 'video';
  const url = `/download?url=${encodeURIComponent(selected.url)}&title=${encodeURIComponent(title)}&ext=${selected.ext}`;
  window.open(url, '_blank');
};