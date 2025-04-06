const urlInput = document.querySelector('input[name="url"]');
const tipoInput = document.querySelector('#tipo');
const formatSelect = document.querySelector('#format_id');

urlInput.addEventListener('change', loadFormats);
tipoInput.addEventListener('change', loadFormats);

async function loadFormats() {
    formatSelect.innerHTML = '';
    if (!urlInput.value) return;
    const res = await fetch(`/formats?url=${encodeURIComponent(urlInput.value)}`);
    const data = await res.json();
    const tipo = tipoInput.value;
    const list = tipo === "Video" ? data.audio : data.video;
    list.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.format_id;
        opt.textContent = tipo === "Audio" ? `${f.abr}kbps - ${f.ext}` : `${f.resolution} - ${f.ext}`;
        formatSelect.appendChild(opt);
    });
}