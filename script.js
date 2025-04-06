document.getElementById('fetch').onclick = async () => {
  const url = document.getElementById('url').value;
  const quality = document.getElementById('quality');
  const preview = document.getElementById('preview');
  quality.innerHTML = '';
  preview.innerHTML = '';
  quality.style.display = 'none';

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

  info.formats.forEach(f => {
    const opt = document.createElement('option');
    opt.value = JSON.stringify(f);
    opt.textContent = `${f.ext} - ${f.resolution || f.abr || '??'}`;
    quality.appendChild(opt);
  });

  quality.style.display = 'inline-block';
  document.getElementById('download').style.display = 'inline-block';
  preview.dataset.title = info.title;
};

document.getElementById('download').onclick = () => {
  const selected = JSON.parse(document.getElementById('quality').value);
  const title = document.getElementById('preview').dataset.title || 'video';
  const url = `/download?url=${encodeURIComponent(selected.url)}&title=${encodeURIComponent(title)}&ext=${selected.ext}`;
  window.open(url, '_blank');
};