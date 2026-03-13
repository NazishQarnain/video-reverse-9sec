const input = document.getElementById('video');
const btn = document.getElementById('btn');
const statusEl = document.getElementById('status');
const result = document.getElementById('result');

btn.onclick = async () => {
  if (!input.files[0]) {
    alert('Select a video');
    return;
  }
  const form = new FormData();
  form.append('video', input.files[0]);
  statusEl.textContent = 'Uploading & processing...';

  try {
    const res = await fetch('/upload', {
      method: 'POST',
      body: form
    });
    const data = await res.json();
    if (data.url) {
      statusEl.textContent = 'Done!';
      result.src = data.url;
    } else {
      statusEl.textContent = 'Error: ' + (data.error || 'unknown');
    }
  } catch (e) {
    statusEl.textContent = 'Request failed';
  }
};
