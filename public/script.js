const input = document.getElementById('video');
const btn = document.getElementById('btn');
const statusEl = document.getElementById('status');
const result = document.getElementById('result');

const UPLOAD_URL = '/upload';

btn.onclick = async () => {
  if (!input.files[0]) {
    alert('Select a video');
    return;
  }

  const form = new FormData();
  form.append('video', input.files[0]);
  statusEl.textContent = 'Uploading & processing...';
  result.removeAttribute('src');

  try {
    const res = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: form,
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      statusEl.textContent = 'Error: ' + (txt || ('HTTP ' + res.status));
      return;
    }

    const data = await res.json().catch(() => null);
    if (data && data.url) {
      statusEl.textContent = 'Done!';
      result.src = data.url;
    } else {
      statusEl.textContent = 'Error: invalid response';
    }
  } catch (e) {
    console.error(e);
    statusEl.textContent = 'Error: ' + (e.message || 'Request failed');
  }
};
