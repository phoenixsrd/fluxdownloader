const urlInput = document.getElementById('url');

async function fetchFormats() {
  const url = urlInput.value.trim();
  const quality = document.getElementById('quality');
  const preview = document.getElementById('preview');
  quality.innerHTML = '';
  preview.innerHTML = '';
  quality.style.display = 'none';

  if (!url) return;

  const res = await fetch('/formats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });

  const data = await res.json();
  if (data.error) return alert(data.error);

  const info = data.results[0];
  preview.innerHTML = `
    <h3>${info.title}</h3>
    <img src="${info.thumbnail}" />
    <p>Duração: ${info.duration}</p>
  `;

  const sortedFormats = info.formats.sort((a, b) => {
    const aRes = parseInt(a.resolution) || 0;
    const bRes = parseInt(b.resolution) || 0;
    return bRes - aRes;
  });

  sortedFormats.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.url;
    opt.textContent = f.resolution ? `${f.ext} - ${f.resolution}` : `${f.ext} - ${f.abr || '??'}kbps`;
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

document.getElementById('download').onclick = () => {
  const url = document.getElementById('quality').value;
  window.open(url, '_blank');
};