let allFormats = [];

async function getInfo() {
  const url = document.getElementById("url").value;
  const res = await fetch("/get_info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  const data = await res.json();
  document.getElementById("title").textContent = data.title;
  document.getElementById("thumb").src = data.thumbnail;
  allFormats = data.formats;
  updateFormats();
  document.getElementById("info").style.display = "block";
}

function updateFormats() {
  const type = document.getElementById("type").value;
  const formatSelect = document.getElementById("format");
  formatSelect.innerHTML = "";

  let filtered = allFormats.filter((f) =>
    type === "Video"
      ? f.has_video && f.has_audio
      : !f.has_video && f.has_audio
  );

  filtered.sort((a, b) => (b.height || 0) - (a.height || 0));

  filtered.forEach((f) => {
    const opt = document.createElement("option");
    const res = f.resolution || "Áudio";
    const size = f.filesize ? (f.filesize / 1048576).toFixed(1) + "MB" : "";
    opt.value = f.format_id;
    opt.text = `${res} - ${f.ext} ${size}`;
    formatSelect.appendChild(opt);
  });
}

async function download() {
  const url = document.getElementById("url").value;
  const format_id = document.getElementById("format").value;
  const convert_mp3 = document.getElementById("convert_mp3").checked;

  const res = await fetch("/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, format_id, convert_mp3 }),
  });

  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "flux-download";
  a.click();
}

async function downloadPlaylist() {
  const url = document.getElementById("url").value;
  const convert_mp3 = document.getElementById("convert_mp3").checked;

  const res = await fetch("/download_playlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, convert_mp3 }),
  });

  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "flux-playlist.zip";
  a.click();
}