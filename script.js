async function getFormats() {
  const url = document.getElementById('url').value;
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = 'Carregando...';

  const res = await fetch('/formats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });

  const data = await res.json();
  resultsDiv.innerHTML = '';

  if (!data || data.length === 0) {
    resultsDiv.innerHTML = '<p>Nenhuma Qualidade Encontrada.</p>';
    return;
  }

  data.forEach(format => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <span>${format.format_note || 'Qualidade'} - ${format.ext.toUpperCase()} (${format.filesize || '?'} bytes)</span>
      <a href="${format.url}" target="_blank">Baixar</a>
    `;
    resultsDiv.appendChild(div);
  });
}
