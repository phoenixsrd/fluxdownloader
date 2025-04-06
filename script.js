async function getFormats() {
  const url = document.getElementById("url").value;
  const mode = document.getElementById("mode").value;
  const res = await fetch("/get-formats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, mode }),
  });

  const data = await res.json();
  const select = document.getElementById("quality");
  select.innerHTML = "";

  data.forEach(f => {
    const size = (f.filesize / (1024 * 1024)).toFixed(1);
    const label = `${f.resolution} (${size} MB)`;
    const option = new Option(label, f.format_id);
    select.add(option);
  });
}

async function download() {
  const url = document.getElementById("url").value;
  const format_id = document.getElementById("quality").value;
  const mode = document.getElementById("mode").value;

  const res = await fetch("/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, format_id, mode }),
  });

  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = window.URL.createObjectURL(blob);
  a.download = mode === "audio" ? "audio.mp3" : "video.mp4";
  a.click();
}