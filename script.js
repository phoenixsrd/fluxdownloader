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

  const filtered = allFormats.filter((f) =>
    type === "video"
      ? f.has_video && f.has_audio
      : !f.has_video && f.has_audio
  );

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

  const res = await fetch("/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, format_id }),
  });

  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "flux-download";
  a.click();
}